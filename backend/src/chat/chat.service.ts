import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message, MessageStatus, MessageType } from './entities/message.entity';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly redisService: RedisService,
  ) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
    messageType: MessageType = MessageType.TEXT,
    clientMessageId?: string,
  ): Promise<Message> {
    // Deduplication: check if client_message_id already exists
    if (clientMessageId) {
      const existing = await this.messageRepo.findOne({
        where: { id: clientMessageId },
      });
      if (existing) {
        return existing;
      }
    }

    const message = this.messageRepo.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type: messageType,
      status: MessageStatus.SENT,
    });

    return this.messageRepo.save(message);
  }

  async markAsDelivered(messageId: string): Promise<void> {
    await this.messageRepo.update(messageId, {
      status: MessageStatus.DELIVERED,
    });
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .whereInIds(messageIds)
      .execute();
  }

  async getMessageHistory(
    userId: string,
    contactId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const qb = this.messageRepo
      .createQueryBuilder('msg')
      .where(
        '((msg.sender_id = :userId AND msg.receiver_id = :contactId) OR (msg.sender_id = :contactId AND msg.receiver_id = :userId))',
        { userId, contactId },
      )
      .orderBy('msg.created_at', 'DESC')
      .take(safeLimit);

    if (cursor) {
      const cursorMsg = await this.messageRepo.findOne({
        where: { id: cursor },
      });
      if (cursorMsg) {
        qb.andWhere('msg.created_at < :cursorDate', {
          cursorDate: cursorMsg.created_at,
        });
      }
    }

    const messages = await qb.getMany();

    return {
      success: true,
      data: {
        messages: messages.reverse(),
        has_more: messages.length === safeLimit,
        next_cursor: messages.length > 0 ? messages[0].id : null,
      },
    };
  }

  async isReceiverOnline(receiverId: string): Promise<boolean> {
    return this.redisService.isUserOnline(receiverId);
  }

  async getReceiverSocketId(receiverId: string): Promise<string | null> {
    return this.redisService.getUserSocketId(receiverId);
  }
}
