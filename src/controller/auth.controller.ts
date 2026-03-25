import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import {
  AuthTokensResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '../dto/auth.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginRequestDto): Promise<AuthTokensResponseDto> {
    return this.authService.login(body);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenRequestDto): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@CurrentUser() user: AuthUser): Promise<{ success: true }> {
    await this.authService.logout(user.sub);
    return { success: true };
  }
}
