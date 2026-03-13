import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';
import {
  AcceptContactDto,
  AddContactDto,
  RemoveContactDto,
} from './dto/contact.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async getContacts(@CurrentUser() user: User) {
    return this.contactsService.getContacts(user.id);
  }

  @Get('requests')
  async getPendingRequests(@CurrentUser() user: User) {
    return this.contactsService.getPendingRequests(user.id);
  }

  @Post('add')
  async addContact(@CurrentUser() user: User, @Body() dto: AddContactDto) {
    return this.contactsService.addContact(
      user.id,
      dto.friend_id,
      dto.friend_username,
    );
  }

  @Delete('remove')
  async removeContact(
    @CurrentUser() user: User,
    @Body() dto: RemoveContactDto,
  ) {
    return this.contactsService.removeContact(user.id, dto.friend_id);
  }

  @Post('accept')
  async acceptContactRequest(
    @CurrentUser() user: User,
    @Body() dto: AcceptContactDto,
  ) {
    return this.contactsService.acceptRequest(user.id, dto.requester_id);
  }
}
