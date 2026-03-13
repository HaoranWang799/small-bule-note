import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ChatModule, AuthModule],
  providers: [ChatGateway],
})
export class WebsocketModule {}
