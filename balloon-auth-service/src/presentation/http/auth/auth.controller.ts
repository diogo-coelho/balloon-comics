import type { Request, Response } from 'express';
import { Throttle } from "@nestjs/throttler";
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { LoginUseCase } from "../../../application/auth/use-cases/login.use-case";
import { LoginDto } from "./dtos/request/login.dto";
import { TokenPayloadParam } from '../decorators/token-payload.param';
import { TokenPayloadDto } from './dtos/request/token-payload.dto';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { LogoutUseCase } from '../../../application/auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/refresh-token.use-case';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password
    });

    this.setAccessTokenCookie(response, result.accessToken as string);
    this.setRefreshTokenCookie(response, result.refreshToken as string);

    return {
      message: 'Acesso concedido',
      data: {
        id: result.user?.id as string,
        email: result.user?.email as string,
      }
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

    this.clearAuthCookies(response);
  }

  @Post('/refresh')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token não fornecido');

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    this.setAccessTokenCookie(response, result.accessToken);
    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      message: 'Tokens atualizados'
    }
  }

  @UseGuards(AuthTokenGuard)
  @Get('me')
  getProfile(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
    };
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
        path: '/',
    });
  }
  
  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
  }
  
  private clearAuthCookies(response: Response) {
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  } 

}