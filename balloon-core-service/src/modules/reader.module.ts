import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ReaderConsumer } from "../presentation/messaging/reader/reader.consume";
import { ReaderController } from "../presentation/http/reader/reader.controller";

import { PROVIDERS_TOKENS } from "../infrastructure/constants/providers-tokens";
import { TypeOrmCoreUnitOfWork } from "../infrastructure/persistence/typeorm/unit-of-work/typeorm-core-unit-of-work";
import { RabbitMqRetryProvider } from "../infrastructure/messaging/rabbit-mq/rabbitmq-retry.provider";

import { CreateReaderFromUserEventUseCase } from "../application/reader/use-cases/create-reader-from-user-event.use-case";

import { CoreUnitOfWorkPort } from "../application/ports/core-unit-of-work.port";
import { ReaderOrmEntity } from "../infrastructure/persistence/typeorm/entities/reader.orm-entity";
import { ProcessedEventOrmEntity } from "../infrastructure/persistence/typeorm/entities/processed-event.orm-entity";
import { ConsumerAggregateVersionOrmEntity } from "../infrastructure/persistence/typeorm/entities/consumer-aggregate-version.orm-entity";
import { UpdateReaderFromUserEventUseCase } from "../application/reader/use-cases/update-reader-from-user-event.use-case";
import { DeleteReaderFromUserEventUseCase } from "../application/reader/use-cases/delete-reader-from-user-event.use-case";

@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      ReaderOrmEntity,
      ProcessedEventOrmEntity,
      ConsumerAggregateVersionOrmEntity
    ]),
  ],
  controllers: [
    ReaderController,
    ReaderConsumer,
  ],
  providers: [
    {
      provide: PROVIDERS_TOKENS.CORE_UNIT_OF_WORK,
      useClass: TypeOrmCoreUnitOfWork,
    },
    {
      provide: CreateReaderFromUserEventUseCase,
      inject: [
        PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
      ],
      useFactory: (
        unitOfWork: CoreUnitOfWorkPort,
      ) => 
        new CreateReaderFromUserEventUseCase(
          unitOfWork
        ),
    },
    {
      provide: UpdateReaderFromUserEventUseCase,
      inject: [
        PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
      ],
      useFactory: (
        unitOfWork: CoreUnitOfWorkPort
      ) => 
        new UpdateReaderFromUserEventUseCase(
          unitOfWork
        )
    },
    {
      provide: DeleteReaderFromUserEventUseCase,
      inject: [
        PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
      ],
      useFactory: (
        unitOfWork: CoreUnitOfWorkPort
      ) => 
        new DeleteReaderFromUserEventUseCase(
          unitOfWork
        )
    },
    RabbitMqRetryProvider,
  ],
  exports: [
    PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
  ]
})
export class ReaderModule {}