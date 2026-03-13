import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @IsUUID()
  receiver_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  message_type?: MessageType;

  @IsOptional()
  @IsString()
  client_message_id?: string; // for deduplication
}

export class MessageHistoryQueryDto {
  @IsUUID()
  contact_id: string;

  @IsOptional()
  @IsString()
  cursor?: string; // last message id for pagination

  @IsOptional()
  limit?: number;
}
