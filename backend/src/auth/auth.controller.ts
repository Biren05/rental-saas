import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirstLoginSetPasswordDto } from './dto/first-login.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiErrorResponses } from '../common/decorators/swagger.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description: 'Registers a user account with email, phone, and password, returning JWT access & refresh tokens.',
  })
  @ApiResponse({ status: 201, description: 'User account successfully created' })
  @ApiErrorResponses()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User Login & Credentials Authentication',
    description: 'Authenticates user credentials and returns JWT Bearer access token, or prompts password reset if temporary.',
  })
  @ApiResponse({ status: 200, description: 'User successfully authenticated or password change required' })
  @ApiErrorResponses()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('first-login/set-password')
  @ApiOperation({
    summary: 'First-time Login Password Generation',
    description: 'Allows a client or user with a temporary password to set their permanent password and activate account.',
  })
  @ApiResponse({ status: 200, description: 'Permanent password updated successfully' })
  @ApiErrorResponses()
  async setFirstPassword(@Body() dto: FirstLoginSetPasswordDto) {
    return this.authService.setNewPasswordFromTemp(dto);
  }
}
