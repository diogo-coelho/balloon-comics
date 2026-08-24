import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigService, ConfigModule } from "@nestjs/config";

import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserEntity } from "./entities/user.entity";

import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { BcryptService } from "../auth/hashing/bcrypt.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: "RABBITMQ_SERVICE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>("RABBITMQ_URL")],
            queue: "auth_queue",
            queueOptions: {
              durable: true
            }
          }
        }),
        inject: [ConfigService]
      }
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
  ],
  exports: [TypeOrmModule]
})
export class UserModule {}