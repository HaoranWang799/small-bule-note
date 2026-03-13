import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
