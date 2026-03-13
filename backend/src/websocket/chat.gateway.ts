import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis/redis.service';
import { ChatService } from '../chat/chat.service';
import { MessageType } from '../chat/entities/message.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private heartbeatTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.userId = userId;

      // Store in Redis
      await this.redisService.setUserOnline(userId, client.id);
      await this.redisService.setSocketUser(client.id, userId);

      // Start heartbeat
      this.startHeartbeat(client);

      // Notify contacts that user is online
      client.broadcast.emit('user:online', { userId });

      client.emit('connected', { userId, socketId: client.id });
      console.log(`User ${userId} connected (socket: ${client.id})`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      await this.redisService.setUserOffline(client.userId);
      await this.redisService.removeSocket(client.id);

      // Stop heartbeat
      this.stopHeartbeat(client.id);

      // Notify contacts
      client.broadcast.emit('user:offline', { userId: client.userId });

      console.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      receiver_id: string;
      content: string;
      message_type?: MessageType;
      client_message_id?: string;
    },
  ) {
    if (!client.userId) return;

    const { receiver_id, content, message_type, client_message_id } = data;

    if (!receiver_id || !content) {
      client.emit('error', { message: 'receiver_id and content are required' });
      return;
    }

    // 1. Save message to PostgreSQL
    const message = await this.chatService.saveMessage(
      client.userId,
      receiver_id,
      content,
      message_type || MessageType.TEXT,
      client_message_id,
    );

    // 2. Acknowledge to sender
    client.emit('message:sent', {
      message_id: message.id,
      client_message_id,
      timestamp: message.created_at,
      status: message.status,
    });

    // 3. Check if receiver is online
    const receiverSocketId = await this.chatService.getReceiverSocketId(receiver_id);

    if (receiverSocketId) {
      // 4a. Deliver in real-time
      this.server.to(receiverSocketId).emit('message:receive', {
        id: message.id,
        sender_id: client.userId,
        content: message.content,
        message_type: message.message_type,
        status: 'delivered',
        created_at: message.created_at,
      });

      // Mark as delivered
      await this.chatService.markAsDelivered(message.id);
    }
    // 4b. If offline, message stays as 'sent' in DB — client fetches on reconnect
  }

  @SubscribeMessage('message:read')
  async handleReadReceipt(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { message_ids: string[] },
  ) {
    if (!client.userId || !data.message_ids?.length) return;

    await this.chatService.markAsRead(data.message_ids);

    // Notify the sender if they're online
    // We'd need to look up sender from the messages — for MVP, broadcast to room
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
    // Reset heartbeat timer
    this.resetHeartbeat(client);
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiver_id: string },
  ) {
    if (!client.userId || !data.receiver_id) return;
    this.emitToUser(data.receiver_id, 'typing:start', {
      userId: client.userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiver_id: string },
  ) {
    if (!client.userId || !data.receiver_id) return;
    this.emitToUser(data.receiver_id, 'typing:stop', {
      userId: client.userId,
    });
  }

  // --- Heartbeat ---

  private startHeartbeat(client: AuthenticatedSocket) {
    const timer = setInterval(async () => {
      // If the client hasn't sent a ping in 30s, disconnect
      if (client.userId) {
        await this.redisService.setUserOffline(client.userId);
        await this.redisService.removeSocket(client.id);
        client.broadcast.emit('user:offline', { userId: client.userId });
        client.disconnect();
      }
    }, 60000); // 60s timeout (client should ping every 30s)

    this.heartbeatTimers.set(client.id, timer);
  }

  private resetHeartbeat(client: AuthenticatedSocket) {
    this.stopHeartbeat(client.id);
    this.startHeartbeat(client);
  }

  private stopHeartbeat(socketId: string) {
    const timer = this.heartbeatTimers.get(socketId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(socketId);
    }
  }

  // --- Helpers ---

  private async emitToUser(userId: string, event: string, data: any) {
    const socketId = await this.redisService.getUserSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
