import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseAuthDto> {
    const responseData = await this.authService.login(loginDto);

    this.setAccessTokenCookie(response, responseData.accessToken as string);
    this.setRefreshTokenCookie(response, responseData.refreshToken as string);

    return {
      message: 'Acesso concedido',
      data: {
        id: responseData.user?.id as string,
        email: responseData.user?.email as string,
      },
      next: responseData.next,
    };
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

  @UseGuards(AuthTokenGuard)
  @Get('me')
  async getProfile(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
    };
  }

  private setAccessTokenCookie (response: Response, accessToken: string) {
    response.cookie("accessToken", accessToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
  }

  private setRefreshTokenCookie (response: Response, refreshToken: string) {
    response.cookie("refreshToken", refreshToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });
  }
}
