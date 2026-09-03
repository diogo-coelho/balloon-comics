import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { MediaModule } from '../media/media.module';
import { AgeVerificationModule } from '../age-verification/age-verification.module';
import { SocialMediaLinkModule } from '../social-media-link/social-media-link.module';

import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { ReaderConsumer } from './reader.consumer';
import { ReaderEntity } from './entities/reader.entity';
import { ProcessedEventEntity } from './entities/processed-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReaderEntity, ProcessedEventEntity]),
    AuthModule,
    StorageModule,
    MediaModule,
    AgeVerificationModule,
    SocialMediaLinkModule,
  ],
  controllers: [ReaderController, ReaderConsumer],
  providers: [ReaderService],
})
export class ReaderModule {}
