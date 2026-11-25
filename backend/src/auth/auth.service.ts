import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirstLoginSetPasswordDto } from './dto/first-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== 'USER') {
      throw new ForbiddenException('Self-registration is restricted to standard USER accounts');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new ConflictException('User with email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash,
        role: 'USER',
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.mustChangePassword) {
      return {
        mustChangePassword: true,
        email: user.email,
        fullName: user.fullName,
        message:
          'First-time login detected. You must set a permanent password before accessing your account.',
      };
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async setNewPasswordFromTemp(dto: FirstLoginSetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    const isMatch = await bcrypt.compare(dto.temporaryPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid temporary password');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return {
      success: true,
      email: user.email,
      message: 'Permanent password set successfully! Please log in with your new password.',
    };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      accessToken,
      refreshToken,
      userId,
      email,
      role,
    };
  }
}
