import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenVerifierPort } from '../../../application/ports/access-token-verifier.port';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth/const/auth.constant';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(private readonly tokenVerifier: AccessTokenVerifierPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException('Token de autenticação não fornecido');

    try {
      const payload = await this.tokenVerifier.verify(token);

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido');
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') return undefined;
    const match = authorization.trim().match(/^Bearer\s+(\S+)$/i);
    return match?.[1];
  }
}
