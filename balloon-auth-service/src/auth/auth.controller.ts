import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { LoginDto } from './dtos/request/login.dto';
import { RefreshTokenDto } from './dtos/request/refresh-token.dto';
import { ResponseAuthDto } from './dtos/response/response-auth.dto';
import { TokenPayloadParam } from './decorators/token-payload.param';
import { TokenPayloadDto } from './dtos/request/token-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ResponseAuthDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthTokenGuard)
  @Post('logout')
  async logout(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ): Promise<void> {
    const { sub: userId } = tokenPayload;
    console.log('Logging out user with ID:', userId);
    return this.authService.logout(userId);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<ResponseAuthDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
