import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/request/login.dto';
import { RefreshTokenDto } from './dtos/request/refresh-token.dto';
import { ResponseAuthDto } from './dtos/response/response-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ResponseAuthDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<ResponseAuthDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
