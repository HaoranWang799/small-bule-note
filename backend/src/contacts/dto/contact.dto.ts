import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class AddContactDto {
  @ValidateIf((object) => !object.friend_username)
  @IsUUID()
  @IsOptional()
  friend_id: string;

  @ValidateIf((object) => !object.friend_id)
  @IsString()
  @IsOptional()
  friend_username: string;
}

export class RemoveContactDto {
  @IsUUID()
  friend_id: string;
}

export class AcceptContactDto {
  @IsUUID()
  requester_id: string;
}
