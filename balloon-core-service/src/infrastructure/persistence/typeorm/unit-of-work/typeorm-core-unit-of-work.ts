import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CoreTransactionalPort } from "../../../../application/ports/core-transactional.port";
import { CoreUnitOfWorkPort } from "../../../../application/ports/core-unit-of-work.port";

import { ReaderOrmEntity } from "../entities/reader.orm-entity";
import { ConsumerAggregateVersionOrmEntity } from "../entities/consumer-aggregate-version.orm-entity";
import { ProcessedEventOrmEntity } from "../entities/processed-event.orm-entity";

import { TypeOrmConsumerAggregateVersionRepository } from "../repositories/typeorm-consumer-aggregate-version.repository";
import { TypeOrmProcessedEventRepository } from "../repositories/typeorm-processed-event.repository";
import { TypeOrmReaderRepository } from "../repositories/typeorm-reader.repository";

@Injectable()
export class TypeOrmCoreUnitOfWork implements CoreUnitOfWorkPort {

  constructor(
    private readonly dataSource: DataSource,
  ) {}
  
  execute<T>(operation: (transaction: CoreTransactionalPort) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const transaction: CoreTransactionalPort = { 
        readers: new TypeOrmReaderRepository(manager.getRepository(ReaderOrmEntity)),
        processedEvents: new TypeOrmProcessedEventRepository(manager.getRepository(ProcessedEventOrmEntity)),
        consumerAggregateVersion: new TypeOrmConsumerAggregateVersionRepository(manager.getRepository(ConsumerAggregateVersionOrmEntity)),
      }

      return operation(transaction);
    })
  }
  
}