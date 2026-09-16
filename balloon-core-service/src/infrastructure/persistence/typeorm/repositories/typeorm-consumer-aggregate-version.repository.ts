import { Repository } from "typeorm";
import { ConsumerAggregateVersionRepositoryPort } from "../../../../application/ports/consumer-aggregate-version.repository.port";
import { ConsumerAggregateVersion } from "../../../../application/types/consumer-aggregate-version";
import { ConsumerAggregateVersionOrmEntity } from "../entities/consumer-aggregate-version.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TypeOrmConsumerAggregateVersionRepository implements ConsumerAggregateVersionRepositoryPort {

  constructor(
    @InjectRepository(ConsumerAggregateVersionOrmEntity)
    private readonly consumerAggregateVersionRepository: Repository<ConsumerAggregateVersionOrmEntity>,
  ) {}

  getOrCreateForUpdate(aggregateId: string, consumer: string): Promise<ConsumerAggregateVersion> {
    throw new Error("Method not implemented.");
  }

  updateVersion(aggregateId: string, consumer: string, version: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
}