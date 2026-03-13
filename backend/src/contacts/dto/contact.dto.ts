import { IsString, IsUUID } from 'class-validator';

export class AddContactDto {
  @IsUUID()
  friend_id: string;
}

export class RemoveContactDto {
  @IsUUID()
  friend_id: string;
}
