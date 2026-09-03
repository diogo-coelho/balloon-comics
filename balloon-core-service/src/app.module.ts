import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core/constants';

import { getJoiConfig } from './config/joi.config';
import { PostgresConfigService } from './config/postgres.config.service';
import { CustomExceptionFilter } from './filters/custom-exception.filter';

import { ReaderModule } from './reader/reader.module';
import { AuthorModule } from './author/author.module';
import { StorageModule } from './storage/storage.module';
import { MediaModule } from './media/media.module';
import { AgeVerificationModule } from './age-verification/age-verification.module';
import { SocialMediaLinkModule } from './social-media-link/social-media-link.module';

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
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService],
    }),
    ReaderModule,
    AuthorModule,
    StorageModule,
    MediaModule,
    AgeVerificationModule,
    SocialMediaLinkModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    }
  ],
})
export class AppModule {}
