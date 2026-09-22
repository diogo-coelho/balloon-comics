import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from '../application/user/use-cases/create-user.use-case';
import { PasswordHasherPort } from '../application/ports/password-hasher.port';
import { AuthUnitOfWorkPort } from '../application/ports/auth-unit-of-work.port';
import { UserOrmEntity } from '../infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeOrmUserRepository } from '../infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { BcryptPasswordHasherAdapter } from '../infrastructure/security/bcrypt-password-hasher.adapter';
import { OutboxOrmEntity } from '../infrastructure/persistence/typeorm/entities/outbox-event.orm-entity';
import { TypeOrmAuthUnitOfWork } from '../infrastructure/persistence/typeorm/unit-of-work/typeorm-auth-unit-of-work';
import { UpdateUserUseCase } from '../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/user/use-cases/delete-user.use-case';
import { UserController } from '../presentation/http/user/user.controller';
import { OutboxEventsPublisher } from '../infrastructure/messaging/outbox/outbox-publisher';
import { RabbitMQProvider } from '../infrastructure/messaging/rabbit-mq/rabbitmq-message-publisher.adapter';
import { PROVIDERS_TOKENS } from '../infrastructure/constants/providers-tokens';
import jwtConfig from '../infrastructure/security/jwt.config';
import { TokenServicePort } from '../application/ports/token-service.port';
import { JwtTokenServiceAdapter } from '../infrastructure/security/jwt-token-service.adapter';
import HttpCookies from '../presentation/http/cookies/http-cookies';
import { JwtAccessTokenVerifierAdapter } from '../infrastructure/security/access-token-verifier.adapter';
import { AuthTokenGuard } from '../presentation/http/guards/auth-token.guard';
import { AccessTokenVerifierPort } from '../application/ports/access-token-verifier.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, OutboxOrmEntity]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [UserController],
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
      provide: PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK,
      useClass: TypeOrmAuthUnitOfWork,
    },
    {
      provide: PROVIDERS_TOKENS.TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter,
    },
    {
      provide: AccessTokenVerifierPort,
      useClass: JwtAccessTokenVerifierAdapter,
    },
    {
      provide: CreateUserUseCase,
      inject: [
        PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK,
        PROVIDERS_TOKENS.PASSWORD_HASHER,
        PROVIDERS_TOKENS.TOKEN_SERVICE,
      ],
      useFactory: (
        users: AuthUnitOfWorkPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort,
      ) => new CreateUserUseCase(users, passwordHasher, tokenService),
    },
    {
      provide: UpdateUserUseCase,
      inject: [
        PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK,
        PROVIDERS_TOKENS.PASSWORD_HASHER,
      ],
      useFactory: (
        users: AuthUnitOfWorkPort,
        passwordHasher: PasswordHasherPort,
      ) => new UpdateUserUseCase(users, passwordHasher),
    },
    {
      provide: DeleteUserUseCase,
      inject: [PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK],
      useFactory: (users: AuthUnitOfWorkPort) => new DeleteUserUseCase(users),
    },
    OutboxEventsPublisher,
    RabbitMQProvider,
    HttpCookies,
    AuthTokenGuard,
  ],
  exports: [PROVIDERS_TOKENS.AUTH_UNIT_OF_WORK],
})
export class UserModule {}
