import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { TokenServicePort } from '../../application/ports/token-service.port';
import { AccessTokenPayload, TokenPayload } from '../../application/types/auth';
import jwtConfig from './jwt.config';

@Injectable()
export class JwtTokenServiceAdapter implements TokenServicePort {

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: payload.userId,
        username: payload.username,
        email: payload.email,
        tokenType: 'access',
      },
      {
        algorithm: 'RS256',
        audience: this.config.signOptions.audience,
        issuer: this.config.signOptions.issuer,
        privateKey: this.config.privateKey,
        expiresIn: this.config.expiresIn,
      },
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        tokenType: 'refresh',
      },
      {
        algorithm: 'RS256',
        audience: this.config.signOptions.audience,
        issuer: this.config.signOptions.issuer,
        privateKey: this.config.privateKey,
        expiresIn: this.config.refreshTokenExpiresIn,
      },
    );
  }

  async verify(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(
      token,
      {
        publicKey: this.config.publicKey,
        ...this.config.verifyOptions,
      }
    );
  }
}