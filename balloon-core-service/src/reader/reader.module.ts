import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { ReaderConsumer } from './reader.consumer';
import { ReaderEntity } from './entities/reader.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReaderEntity]), 
    AuthModule,
  ],
  controllers: [ReaderController, ReaderConsumer],
  providers: [ReaderService],
})
export class ReaderModule {}