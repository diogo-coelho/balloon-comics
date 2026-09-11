import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReaderEntity } from '../reader/entities/reader.entity';

import { AuthModule } from '../auth/auth.module';

import { AgeVerificationController } from './age-verification.controller';
import { AgeVerificationService } from './age-verification.service';
import { AgeVerificationEntity } from './entities/age-verification.entity';
import { AgeVerificationMapper } from './mappers/age-verification.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgeVerificationEntity, ReaderEntity]), AuthModule],
  controllers: [AgeVerificationController],
  providers: [AgeVerificationService, AgeVerificationMapper],
  exports: [AgeVerificationService, AgeVerificationMapper],
})
export class AgeVerificationModule {}
