import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async getContacts(userId: string) {
    const friendships = await this.friendshipRepo.find({
      where: [
        { user_id: userId, status: 'accepted' },
        { friend_id: userId, status: 'accepted' },
      ],
      relations: ['user', 'friend'],
    });

    const onlineUsers = await this.redisService.getAllOnlineUsers();

    const contacts = friendships.map((f) => {
      const contact = f.user_id === userId ? f.friend : f.user;
      return {
        id: contact.id,
        username: contact.username,
        email: contact.email,
        avatar_url: contact.avatar_url,
        status: onlineUsers[contact.id] ? 'online' : contact.status,
        friendship_id: f.id,
      };
    });

    return { success: true, data: contacts };
  }

  async getPendingRequests(userId: string) {
    const requests = await this.friendshipRepo.find({
      where: { friend_id: userId, status: 'pending' },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    const onlineUsers = await this.redisService.getAllOnlineUsers();

    return {
      success: true,
      data: requests.map((request) => ({
        request_id: request.id,
        requester_id: request.user.id,
        username: request.user.username,
        email: request.user.email,
        avatar_url: request.user.avatar_url,
        status: onlineUsers[request.user.id] ? 'online' : request.user.status,
        created_at: request.created_at,
      })),
    };
  }

  async addContact(userId: string, friendId?: string, friendUsername?: string) {
    const normalizedUsername = friendUsername?.trim();
    let resolvedFriendId = friendId;

    if (!resolvedFriendId && !normalizedUsername) {
      throw new BadRequestException('friend_id or friend_username is required');
    }

    if (!resolvedFriendId && normalizedUsername) {
      const friend = await this.userRepo.findOne({
        where: { username: normalizedUsername },
      });

      if (!friend) {
        throw new NotFoundException('User not found');
      }

      resolvedFriendId = friend.id;
    }

    if (!resolvedFriendId) {
      throw new NotFoundException('User not found');
    }

    if (userId === resolvedFriendId) {
      throw new BadRequestException('Cannot add yourself as a contact');
    }

    const existing = await this.friendshipRepo.findOne({
      where: [
        { user_id: userId, friend_id: resolvedFriendId },
        { user_id: resolvedFriendId, friend_id: userId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Already friends');
      }
      if (existing.status === 'pending' && existing.friend_id === userId) {
        // Accept the pending request
        existing.status = 'accepted';
        await this.friendshipRepo.save(existing);
        return { success: true, message: 'Friend request accepted' };
      }
      throw new ConflictException('Friend request already sent');
    }

    const friendship = this.friendshipRepo.create({
      user_id: userId,
      friend_id: resolvedFriendId,
      status: 'pending',
    });
    await this.friendshipRepo.save(friendship);
    return { success: true, message: 'Friend request sent' };
  }

  async removeContact(userId: string, friendId: string) {
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipRepo.remove(friendship);
    return { success: true, message: 'Contact removed' };
  }

  async acceptRequest(userId: string, requesterId: string) {
    const request = await this.friendshipRepo.findOne({
      where: {
        user_id: requesterId,
        friend_id: userId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = 'accepted';
    await this.friendshipRepo.save(request);
    return { success: true, message: 'Friend request accepted' };
  }
}
