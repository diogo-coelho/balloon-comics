import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { ReaderConsumer } from './reader.consumer';
import { ReaderEntity } from './entities/reader.entity';
import { ProcessedEventEntity } from './entities/processed-event.entity';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReaderEntity, ProcessedEventEntity]),
    AuthModule,
    StorageModule,
  ],
  controllers: [ReaderController, ReaderConsumer],
  providers: [ReaderService],
})
export class ReaderModule {}
