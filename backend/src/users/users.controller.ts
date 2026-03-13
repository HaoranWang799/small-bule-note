import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Get('search')
  async searchUsers(
    @CurrentUser() user: User,
    @Query('q') query?: string,
  ) {
    return this.usersService.searchUsers(user.id, query || '');
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get(':id')
  async getUserSummary(
    @CurrentUser() user: User,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.getUserSummary(user.id, targetUserId);
  }
}
