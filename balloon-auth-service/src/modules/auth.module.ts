import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserOrmEntity } from "../infrastructure/persistence/typeorm/entities/user.orm-entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmUserRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-user.repository";
import { BcryptPasswordHasherAdapter } from "../infrastructure/security/bcrypt-password-hasher.adapter";
import { JwtTokenServiceAdapter } from "../infrastructure/security/jwt-token-service.adapter";
import { LoginUseCase } from "../application/auth/use-cases/login.use-case";
import { UserRepositoryPort } from "../application/ports/user.repository.port";
import { PasswordHasherPort } from "../application/ports/password-hasher.port";
import { TokenServicePort } from "../application/ports/token-service.port";
import { RefreshTokenUseCase } from "../application/auth/use-cases/refresh-token.use-case";
import jwtConfig from "../infrastructure/security/jwt.config";
import { AuthController } from "../presentation/http/auth/auth.controller";
import { AuthUnitOfWorkPort } from "../application/ports/auth-unit-of-work.port";
import { LogoutUseCase } from "../application/auth/use-cases/logout.use-case";

const USER_REPOSITORY = Symbol('UserRepository');
const PASSWORD_HASHER = Symbol('PasswordHasher');
const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
const AUTH_UNIT_OF_WORK = Symbol('AuthUnitOfWork');

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity
    ]),
    ConfigModule.forFeature(
      jwtConfig
    ),
    JwtModule.registerAsync(
      jwtConfig.asProvider(),
    )
  ],
  controllers: [
    AuthController
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter
    },
    {
      provide: LoginUseCase,
      inject: [
        USER_REPOSITORY,
        PASSWORD_HASHER,
        TOKEN_SERVICE
      ],
      useFactory: (
        users: UserRepositoryPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort
      ) => new LoginUseCase(
        users,
        passwordHasher,
        tokenService
      )
    },
    {
      provide: RefreshTokenUseCase,
      inject: [
        AUTH_UNIT_OF_WORK,
        PASSWORD_HASHER,
        TOKEN_SERVICE
      ],
      useFactory: (
        unitOfWork: AuthUnitOfWorkPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort
      ) => new RefreshTokenUseCase(
        unitOfWork,
        passwordHasher,
        tokenService
      )
    },
    {
      provide: LogoutUseCase,
      inject: [
        USER_REPOSITORY
      ],
      useFactory: (
        users: UserRepositoryPort
      ) => new LogoutUseCase(users)
    }
  ]
})
export class AuthModule {}