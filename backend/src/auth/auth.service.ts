import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const username = dto.username.trim();
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      username,
      email,
      password_hash,
    });
    await this.userRepo.save(user);

    const token = this.generateToken(user);
    return {
      success: true,
      data: {
        user: { id: user.id, username: user.username, email: user.email },
        access_token: token,
      },
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.username.trim();
    const user = await this.userRepo.findOne({
      where: [{ username: identifier }, { email: identifier.toLowerCase() }],
      select: ['id', 'username', 'email', 'password_hash', 'avatar_url', 'status'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          status: user.status,
        },
        access_token: token,
      },
    };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, username: user.username });
  }
}
