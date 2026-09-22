import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import {
  AccessTokenPayload,
  AccessTokenVerifierPort,
} from '../../application/ports/access-token-verifier.port';

import jwtConfig from './jwt.config';

@Injectable()
export class JwtAccessTokenVerifierAdapter implements AccessTokenVerifierPort {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async verify(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      publicKey: this.jwtConfiguration.publicKey,
      ...this.jwtConfiguration.verifyOptions,
    });

    if (payload.tokenType !== 'access') {
      throw new Error('Invalid access token');
    }

    return payload as AccessTokenPayload;
  }
}
