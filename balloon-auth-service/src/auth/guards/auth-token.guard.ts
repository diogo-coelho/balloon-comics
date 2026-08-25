import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import type { ConfigType } from "@nestjs/config";

import jwtConfig from "../config/jwt.config";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../constants/autn.constant";

@Injectable()
export class AuthTokenGuard implements CanActivate {

  constructor (
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Token de autenticação não fornecido');

    try {
      const payload =await this.jwtService.verifyAsync(token, this.jwtConfiguration);
      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
      return true;
    } catch (error: Error | undefined | any) {
      throw new UnauthorizedException('Token de autenticação inválido');
    }
  }  
  
  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') return undefined;

    return authorization.split(' ')[1];
  }

}