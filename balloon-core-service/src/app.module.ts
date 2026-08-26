import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core/constants';

import { getJoiConfig } from './config/joi.config';
import { ReaderModule } from './reader/reader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: getJoiConfig(),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
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
    ReaderModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
