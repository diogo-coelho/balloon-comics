import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginUseCase } from '../../../application/auth/use-cases/login.use-case';
import { LoginDto } from './dtos/request/login.dto';
import { TokenPayloadParam } from '../decorators/token-payload.param';
import { TokenPayloadDto } from './dtos/request/token-payload.dto';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { LogoutUseCase } from '../../../application/auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/refresh-token.use-case';
import HttpCookies from '../cookies/http-cookies';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly httpCookies: HttpCookies,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
    });

    this.httpCookies.setAccessTokenCookie(response, result.accessToken);
    this.httpCookies.setRefreshTokenCookie(response, result.refreshToken);

    return {
      message: 'Acesso concedido',
      data: {
        id: result.user?.id,
        email: result.user?.email,
      },
    };
  }

  @UseGuards(AuthTokenGuard)
  @Post('/logout')
  async logout(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sub: userId } = tokenPayload;
    await this.logoutUseCase.execute(userId);

    this.httpCookies.clearAuthCookies(response);
  }

  @Post('/refresh')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token não fornecido');

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    this.httpCookies.setAccessTokenCookie(response, result.accessToken);
    this.httpCookies.setRefreshTokenCookie(response, result.refreshToken);

    return {
      message: 'Tokens atualizados',
    };
  }

  @UseGuards(AuthTokenGuard)
  @Get('me')
  getProfile(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
    };
  }
}
