import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  // --- Online status ---

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.client.hset('online_users', userId, socketId);
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.client.hdel('online_users', userId);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const result = await this.client.hexists('online_users', userId);
    return result === 1;
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    return this.client.hget('online_users', userId);
  }

  async getAllOnlineUsers(): Promise<Record<string, string>> {
    return this.client.hgetall('online_users');
  }

  // --- Socket mapping ---

  async setSocketUser(socketId: string, userId: string): Promise<void> {
    await this.client.hset('socket_users', socketId, userId);
  }

  async getSocketUser(socketId: string): Promise<string | null> {
    return this.client.hget('socket_users', socketId);
  }

  async removeSocket(socketId: string): Promise<void> {
    await this.client.hdel('socket_users', socketId);
  }

  // --- Pub/Sub ---

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  getClient(): Redis {
    return this.client;
  }
}
