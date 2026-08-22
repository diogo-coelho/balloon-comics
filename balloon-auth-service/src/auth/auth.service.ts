import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";
import { Repository } from "typeorm";

import jwtConfig from "./config/jwt.config";
import { HashingServiceProtocol } from "./hashing/hashing.service";
import { UserEntity } from "../user/entities/user.entity";
import { LoginDto } from "./dtos/request/login.dto";
import { ResponseAuthDto } from "./dtos/response/response-auth.dto";
import { UserEmailNotFoundError } from "./error/user-email-not-found.error";
import { PasswordNotMatchError } from "./error/password-not-match.error";

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserEntity) 
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingServiceProtocol,
    @Inject(jwtConfig.KEY) 
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<ResponseAuthDto> {
    try {
      const { email, password } = loginDto;
      
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new UserEmailNotFoundError(email);
      
      const isPasswordValid = await this.hashingService.compare(password, user?.passwordHash || '');
      if (!isPasswordValid) throw new PasswordNotMatchError();

      const accessToken = await this.getAccessToken(user.id!, user.username!, user.email!);
      const nextUrl = await this.getNextUrl();

      return {
        message: 'Acesso concedido',
        data: {
          accessToken: accessToken,
        },
        next: nextUrl,
        statusCode: 200
      }
    } catch (error: Error | undefined | any) {
      return {
        message: 'Erro ao realizar login',
        error,
        statusCode: error?.status || 500
      }
    }
  }

  async getAccessToken(userId: string, username: string, email: string): Promise<string> {
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      username: username,
      email: email,
    },{
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.expiresIn,
    });

    return accessToken;
  }

  async getNextUrl(): Promise<string> {
    const nextUrl = process.env.NEXT_URL! + '\/reader\/create';
    return nextUrl;
  }
  
}