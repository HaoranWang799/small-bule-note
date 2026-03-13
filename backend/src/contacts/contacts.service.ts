import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
  ) {}

  async getContacts(userId: string) {
    const friendships = await this.friendshipRepo.find({
      where: [
        { user_id: userId, status: 'accepted' },
        { friend_id: userId, status: 'accepted' },
      ],
      relations: ['user', 'friend'],
    });

    const contacts = friendships.map((f) => {
      const contact = f.user_id === userId ? f.friend : f.user;
      return {
        id: contact.id,
        username: contact.username,
        avatar_url: contact.avatar_url,
        status: contact.status,
        friendship_id: f.id,
      };
    });

    return { success: true, data: contacts };
  }

  async addContact(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException('Cannot add yourself as a contact');
    }

    const existing = await this.friendshipRepo.findOne({
      where: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
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
      friend_id: friendId,
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
}
