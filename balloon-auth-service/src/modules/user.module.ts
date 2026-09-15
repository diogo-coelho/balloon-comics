import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "../user/user.controller";
import { CreateUserUseCase } from "../application/user/use-cases/create-user.use-case";
import { PasswordHasherPort } from "../application/ports/password-hasher.port";
import { AuthUnitOfWorkPort } from "../application/ports/auth-unit-of-work.port";
import { UserOrmEntity } from "../infrastructure/persistence/typeorm/entities/user.orm-entity";
import { TypeOrmUserRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-user.repository";
import { BcryptPasswordHasherAdapter } from "../infrastructure/security/bcrypt-password-hasher.adapter";
import { OutboxOrmEntity } from "../infrastructure/persistence/typeorm/entities/outbox-event.orm-entity";
import { TypeOrmAuthUnitOfWork } from "../infrastructure/persistence/typeorm/unit-of-work/typeorm-auth-unit-of-work";
import { OutboxEventsPublisher } from "../provider/outbox-event.publish";
import { RabbitMQProvider } from "../provider/rabbit-mq.provider";

const USER_REPOSITORY = Symbol('UserRepository');
const PASSWORD_HASHER = Symbol('PasswordHasher');
const AUTH_UNIT_OF_WORK = Symbol('AuthUnitOfWork');

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      OutboxOrmEntity,
    ]),
  ],
  controllers: [
    UserController,
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: AUTH_UNIT_OF_WORK,
      useClass: TypeOrmAuthUnitOfWork,
    },
    {
      provide: CreateUserUseCase,
      inject: [
        AUTH_UNIT_OF_WORK,
        PASSWORD_HASHER,
      ],
      useFactory: (
        users: AuthUnitOfWorkPort,
        passwordHasher: PasswordHasherPort,
      ) => 
        new CreateUserUseCase(
          users,
          passwordHasher,
        )
    },
    OutboxEventsPublisher,
    RabbitMQProvider,
  ]
})
export class UserModule {}