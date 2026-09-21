import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../infrastructure/security/jwt.config';
import HttpCookies from '../presentation/http/cookies/http-cookies';
import { UserOrmEntity } from '../infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmUserRepository } from '../infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { BcryptPasswordHasherAdapter } from '../infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtTokenServiceAdapter } from '../infrastructure/security/jwt-token-service.adapter';
import { LoginUseCase } from '../application/auth/use-cases/login.use-case';
import { UserRepositoryPort } from '../application/ports/user.repository.port';
import { PasswordHasherPort } from '../application/ports/password-hasher.port';
import { TokenServicePort } from '../application/ports/token-service.port';
import { RefreshTokenUseCase } from '../application/auth/use-cases/refresh-token.use-case';
import { AuthController } from '../presentation/http/auth/auth.controller';
import { AuthUnitOfWorkPort } from '../application/ports/auth-unit-of-work.port';
import { LogoutUseCase } from '../application/auth/use-cases/logout.use-case';
import { PROVIDERS_TOKENS } from '../infrastructure/constants/providers-tokens';
import { UserModule } from './user.module';
import { JwtAccessTokenVerifierAdapter } from '../infrastructure/security/access-token-verifier.adapter';
import { AuthTokenGuard } from '../presentation/http/guards/auth-token.guard';
import { AccessTokenVerifierPort } from '../application/ports/access-token-verifier.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: PROVIDERS_TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PROVIDERS_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: PROVIDERS_TOKENS.TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter,
    },
    {
      provide: AccessTokenVerifierPort,
      useClass: JwtAccessTokenVerifierAdapter,
    },
    HttpCookies,
    AuthTokenGuard,
    {
      provide: LoginUseCase,
      inject: [
        PROVIDERS_TOKENS.USER_REPOSITORY,
        PROVIDERS_TOKENS.PASSWORD_HASHER,
        PROVIDERS_TOKENS.TOKEN_SERVICE,
      ],
      useFactory: (
        users: UserRepositoryPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort,
      ) => new LoginUseCase(users, passwordHasher, tokenService),
    },
    {
      provide: RefreshTokenUseCase,
      inject: [
        PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK,
        PROVIDERS_TOKENS.PASSWORD_HASHER,
        PROVIDERS_TOKENS.TOKEN_SERVICE,
      ],
      useFactory: (
        unitOfWork: AuthUnitOfWorkPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort,
      ) => new RefreshTokenUseCase(unitOfWork, passwordHasher, tokenService),
    },
    {
      provide: LogoutUseCase,
      inject: [PROVIDERS_TOKENS.USER_REPOSITORY],
      useFactory: (users: UserRepositoryPort) => new LogoutUseCase(users),
    },
  ],
})
export class AuthModule {}
