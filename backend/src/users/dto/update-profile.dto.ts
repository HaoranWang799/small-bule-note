import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
