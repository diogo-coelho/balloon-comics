import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import jwtConfig from "./config/jwt.config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { HashingServiceProtocol } from "./hashing/hashing.service";
import { BcryptService } from "./hashing/bcrypt.service";

import { UserEntity } from "../user/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],  
  controllers: [AuthController],
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    }, 
    AuthService
  ],
  exports: [
    HashingServiceProtocol,
    AuthService,
  ]
})
export class AuthModule {}