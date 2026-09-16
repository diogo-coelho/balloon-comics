import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReaderEntity } from "../reader/entities/reader.entity";
import { ProcessedEventEntity } from "../reader/entities/processed-event.entity";
import { ConsumerAggregateVersionEntity } from "../reader/entities/consumer-aggregate-version.entity";
import { ReaderConsumer } from "../presentation/messaging/reader/reader.consume";
import { ReaderController } from "../presentation/http/reader/reader.controller";
import { PROVIDERS_TOKENS } from "../infrastructure/constants/providers-tokens";
import { TypeOrmCoreUnitOfWork } from "../infrastructure/persistence/typeorm/unit-of-work/typeorm-core-unit-of-work";
import { RabbitMqRetryProvider } from "../infrastructure/messaging/rabbit-mq/rabbitmq-retry.provider";
import { CreateReaderFromUserEventUseCase } from "../application/reader/use-cases/create-reader-from-user-event.use-case";
import { CoreUnitOfWorkPort } from "../application/ports/core-unit-of-work.port";

@Module({
  imports: [
    TypeOrmModule.forFeature([ ReaderEntity, ProcessedEventEntity, ConsumerAggregateVersionEntity ]),
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
        PROVIDERS_TOKENS.READER_REPOSITORY
      ],
      useFactory: (
        unitOfWork: CoreUnitOfWorkPort,
      ) => 
        new CreateReaderFromUserEventUseCase(
          unitOfWork
        ),
    },
    RabbitMqRetryProvider,
  ],
  exports: [
    PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
  ]
})
export class ReaderModule {}