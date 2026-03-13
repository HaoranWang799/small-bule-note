import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { Friendship } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User]), RedisModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
