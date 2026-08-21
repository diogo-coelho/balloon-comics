import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_DATABASE_HOST,
      port: Number(process.env.PG_DATABASE_PORT),
      database: process.env.PG_DATABASE_NAME,
      username: process.env.PG_DATABASE_USERNAME,
      password: process.env.PG_DATABASE_PASSWORD,
      autoLoadEntities: true,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
