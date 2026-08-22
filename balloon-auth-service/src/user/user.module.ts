import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserEntity } from "./entities/user.entity";

import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { BcryptService } from "../auth/hashing/bcrypt.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule
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