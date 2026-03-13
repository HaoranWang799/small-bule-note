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
import { AddContactDto, RemoveContactDto } from './dto/contact.dto';
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

  @Post('add')
  async addContact(@CurrentUser() user: User, @Body() dto: AddContactDto) {
    return this.contactsService.addContact(user.id, dto.friend_id);
  }

  @Delete('remove')
  async removeContact(
    @CurrentUser() user: User,
    @Body() dto: RemoveContactDto,
  ) {
    return this.contactsService.removeContact(user.id, dto.friend_id);
  }
}
