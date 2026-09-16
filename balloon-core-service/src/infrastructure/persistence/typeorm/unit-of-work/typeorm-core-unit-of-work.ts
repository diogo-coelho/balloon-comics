import { Injectable } from "@nestjs/common";
import { CoreTransactionalPort } from "../../../../application/ports/core-transactional.port";
import { CoreUnitOfWorkPort } from "../../../../application/ports/core-unit-of-work.port";
import { DataSource } from "typeorm";
import { TypeOrmReaderRepository } from "../repositories/typeorm-reader.repository";
import { ReaderOrmEntity } from "../entities/reader.orm-entity";
import { ProcessedEventOrmEntity } from "../entities/processed-event.orm-entity";
import { ConsumerAggregateVersionEntity } from "../../../../reader/entities/consumer-aggregate-version.entity";
import { TypeOrmConsumerAggregateVersionRepository } from "../repositories/typeorm-consumer-aggregate-version.repository";
import { TypeOrmProcessedEventRepository } from "../repositories/typeorm-processed-event.repository";

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
        consumerAggregateVersion: new TypeOrmConsumerAggregateVersionRepository(manager.getRepository(ConsumerAggregateVersionEntity)),
      }

      return operation(transaction);
    })
  }
  
}