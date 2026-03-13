import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Friendship } from '../contacts/entities/friendship.entity';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship]), RedisModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
