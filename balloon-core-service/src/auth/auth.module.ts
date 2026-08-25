import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import jwtConfig from "./config/jwt.config";

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [],
  exports: [
    JwtModule,
    ConfigModule,
  ],
})
export class AuthModule {}