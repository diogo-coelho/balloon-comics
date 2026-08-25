import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserEntity } from "./entities/user.entity";
import { OutboxEventEntity } from "./entities/outbox-event.entity";

import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { BcryptService } from "../auth/hashing/bcrypt.service";
import { AuthModule } from "../auth/auth.module";
import { RabbitMQProvider } from "../provider/rabbit-mq.provider";
import { OutboxEventsPublisher } from "../provider/outbox-event.publish";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([OutboxEventEntity]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    OutboxEventsPublisher,
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    RabbitMQProvider,
  ],
  exports: [TypeOrmModule]
})
export class UserModule {}