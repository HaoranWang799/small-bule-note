import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { ChatModule } from './chat/chat.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RedisModule } from './common/redis/redis.module';
import { HealthController } from './health.controller';
import { UiController } from './ui.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    RedisModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    ChatModule,
    WebsocketModule,
  ],
  controllers: [HealthController, UiController],
})
export class AppModule {}
