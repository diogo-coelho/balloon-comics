import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request,Response } from 'express';

import { AuthService } from './auth.service';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { LoginDto } from './dtos/request/login.dto';
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
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { sub: userId } = tokenPayload;
    this.clearAuthCookies(response);
    return this.authService.logout(userId);
  }

  @Post('refresh')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseAuthDto> {
    console.log("request.cookies:", request.cookies);
    const refreshToken = request.cookies?.refreshToken;
    console.log("refreshToken:", refreshToken);
    if (!refreshToken) throw new UnauthorizedException('Refresh token não fornecido');

    const responseData = await this.authService.refreshTokens({ refreshToken });

    this.setAccessTokenCookie(response, responseData.accessToken as string);
    this.setRefreshTokenCookie(response, responseData.refreshToken as string);

    return {
      message: 'Tokens atualizados',
    };
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
      path: "/api/auth/refresh",
    });
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie("accessToken", { path: "/" });
    response.clearCookie("refreshToken", { path: "/auth/refresh" });
  }
}
