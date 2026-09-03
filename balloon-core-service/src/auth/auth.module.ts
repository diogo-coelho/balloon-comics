import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from './config/jwt.config';
import { AuthTokenGuard } from './guards/auth-token.guard';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [AuthTokenGuard],
  exports: [AuthTokenGuard, JwtModule, ConfigModule],
})
export class AuthModule {}
