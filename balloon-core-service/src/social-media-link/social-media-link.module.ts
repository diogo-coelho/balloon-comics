import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { SocialMediaLinkController } from './social-media-link.controller';
import { SocialMediaLinkEntity } from './entities/social-media-link.entity';
import { SocialMediaLinkService } from './social-media-link.service';
import { SocialMediaLinkMapper } from './mappers/social-media-link.mapper';


@Module({
  imports: [
    TypeOrmModule.forFeature([SocialMediaLinkEntity]),
    AuthModule,
  ],
  controllers: [SocialMediaLinkController],
  providers: [SocialMediaLinkService, SocialMediaLinkMapper],
  exports: [SocialMediaLinkService, SocialMediaLinkMapper],
})
export class SocialMediaLinkModule {}