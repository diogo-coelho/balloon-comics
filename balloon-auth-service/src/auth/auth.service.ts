import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import jwtConfig from './config/jwt.config';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { UserEntity } from '../user/entities/user.entity';

import { LoginDto } from './dtos/request/login.dto';
import { RefreshTokenDto } from './dtos/request/refresh-token.dto';
import { ResponseAuthDto } from './dtos/response/response-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingServiceProtocol,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<ResponseAuthDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    const isPasswordValid = await this.hashingService.compare(
      password,
      user?.passwordHash || '',
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const nextUrl = await this.getNextUrl('\/home');

    return {
      message: 'Acesso concedido',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      next: nextUrl,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: null });
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<ResponseAuthDto> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Token de atualização inválido');
      }

      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Acesso negado');
      }

      const isTokenValid = await this.hashingService.compare(
        refreshTokenDto.refreshToken,
        user.refreshTokenHash,
      );

      if (!isTokenValid) {
        await this.userRepository.update(user.id, { refreshTokenHash: null });

        throw new UnauthorizedException(
          'Detecção de reuso de token. Faça login novamente.',
        );
      }

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        message: 'Tokens renovados com sucesso',
        data: { accessToken, refreshToken },
      };
    } catch (error: Error | undefined | any) {
      throw new UnauthorizedException(
        'Token de atualização inválido, expirado ou reutilizado',
      );
    }
  }

  async signJwtAsync<T>(
    sub: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }

  async getNextUrl(resource: string): Promise<string> {
    const nextUrl = process.env.NEXT_URL! + resource;
    return nextUrl;
  }

  async generateTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signJwtAsync(
      user.id,
      this.jwtConfiguration.expiresIn,
      { username: user.username, email: user.email, tokenType: 'access' },
    );

    const refreshToken = await this.signJwtAsync(
      user.id,
      this.jwtConfiguration.refreshTokenExpiresIn,
      { tokenType: 'refresh' }
    );

    const refreshTokenHash = await this.hashingService.hash(refreshToken);
    await this.userRepository.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }
}
