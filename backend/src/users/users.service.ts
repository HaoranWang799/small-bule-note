import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Friendship } from '../contacts/entities/friendship.entity';
import { RedisService } from '../common/redis/redis.service';

export type RelationshipStatus =
  | 'self'
  | 'none'
  | 'pending_outgoing'
  | 'pending_incoming'
  | 'accepted';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { success: true, data: user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const nextUsername = dto.username?.trim();
    const nextEmail = dto.email?.trim().toLowerCase();

    if (nextUsername && nextUsername !== user.username) {
      const existingUser = await this.userRepo.findOne({
        where: { username: nextUsername, id: Not(userId) },
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
      user.username = nextUsername;
    }

    if (nextEmail && nextEmail !== user.email) {
      const existingEmail = await this.userRepo.findOne({
        where: { email: nextEmail, id: Not(userId) },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
      user.email = nextEmail;
    }

    if (dto.avatar_url !== undefined) {
      user.avatar_url = dto.avatar_url;
    }

    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    await this.userRepo.save(user);
    return { success: true, data: user };
  }

  async findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async searchUsers(userId: string, query: string) {
    const keyword = query.trim();
    if (!keyword) {
      return { success: true, data: [] };
    }

    const users = await this.userRepo.find({
      where: [
        { username: ILike(`%${keyword}%`) },
        { email: ILike(`%${keyword}%`) },
      ],
      take: 20,
      order: { created_at: 'DESC' },
    });

    const filteredUsers = users.filter((candidate) => candidate.id !== userId);
    const onlineUsers = await this.redisService.getAllOnlineUsers();

    const results = await Promise.all(
      filteredUsers.map(async (candidate) => ({
        id: candidate.id,
        username: candidate.username,
        email: candidate.email,
        avatar_url: candidate.avatar_url,
        status: onlineUsers[candidate.id] ? 'online' : candidate.status,
        relationship_status: await this.getRelationshipStatus(userId, candidate.id),
      })),
    );

    return { success: true, data: results };
  }

  async getUserSummary(userId: string, targetUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOnline = await this.redisService.isUserOnline(targetUserId);

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        status: isOnline ? 'online' : user.status,
        relationship_status: await this.getRelationshipStatus(userId, targetUserId),
      },
    };
  }

  async getRelationshipStatus(
    currentUserId: string,
    targetUserId: string,
  ): Promise<RelationshipStatus> {
    if (currentUserId === targetUserId) {
      return 'self';
    }

    const friendship = await this.friendshipRepo.findOne({
      where: [
        { user_id: currentUserId, friend_id: targetUserId },
        { user_id: targetUserId, friend_id: currentUserId },
      ],
    });

    if (!friendship) {
      return 'none';
    }

    if (friendship.status === 'accepted') {
      return 'accepted';
    }

    return friendship.user_id === currentUserId
      ? 'pending_outgoing'
      : 'pending_incoming';
  }
}
