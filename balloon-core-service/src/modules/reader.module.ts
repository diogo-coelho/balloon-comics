import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

import { ReaderConsumer } from "../infrastructure/messaging/rabbit-mq/consumers/readers/reader.consume";
import { ReaderController } from "../presentation/http/reader/reader.controller";
import { AuthTokenGuard } from "../presentation/http/guards/auth-token.guard";

import jwtConfig from "../infrastructure/security/jwt.config";
import { PROVIDERS_TOKENS } from "../infrastructure/constants/providers-tokens";
import { RabbitMqRetryProvider } from "../infrastructure/messaging/rabbit-mq/rabbitmq-retry.provider";
import { SharpImageProcessorAdapter } from "../infrastructure/media/sharp-image-processor.adapter";
import { AwsS3StorageAdapter } from "../infrastructure/storage/aws-s3-storage.adapter";

import { UpdateReaderFromUserEventUseCase } from "../application/reader/use-cases/update-reader-from-user-event.use-case";
import { DeleteReaderFromUserEventUseCase } from "../application/reader/use-cases/delete-reader-from-user-event.use-case";
import { CreateReaderFromUserEventUseCase } from "../application/reader/use-cases/create-reader-from-user-event.use-case";
import { GetReaderUseCase } from "../application/reader/use-cases/get-reader.use-case";
import { UploadReaderImageUseCase } from "../application/reader/use-cases/upload-reader-image.use-case";
import { UpdateReaderUseCase } from "../application/reader/use-cases/update-reader.use-case";

import { ReaderRepositoryPort } from "../application/ports/reader.repository.port";
import { CoreUnitOfWorkPort } from "../application/ports/core-unit-of-work.port";
import { AgeVerificationRepositoryPort } from "../application/ports/age-verification.repository.port";
import { SocialmediaLinkRepositoryPort } from "../application/ports/social-media-link.repository.port";
import { StoragePort } from "../application/ports/storage.port";
import { ImageProcessorPort } from "../application/ports/image.processor.port";

import { ReaderOrmEntity } from "../infrastructure/persistence/typeorm/entities/reader.orm-entity";
import { ProcessedEventOrmEntity } from "../infrastructure/persistence/typeorm/entities/processed-event.orm-entity";
import { ConsumerAggregateVersionOrmEntity } from "../infrastructure/persistence/typeorm/entities/consumer-aggregate-version.orm-entity";
import { AgeVerificationOrmEntity } from "../infrastructure/persistence/typeorm/entities/age-verification.orm-entity";
import { SocialMediaLinkOrmEntity } from "../infrastructure/persistence/typeorm/entities/social-media-link.orm-entity";

import { TypeOrmCoreUnitOfWork } from "../infrastructure/persistence/typeorm/unit-of-work/typeorm-core-unit-of-work";
import { TypeOrmReaderRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-reader.repository";
import { TypeOrmAgeVerificationRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-age-verification.repository";
import { TypeOrmSocialMediaLinkRepository } from "../infrastructure/persistence/typeorm/repositories/typeorm-social-media-link.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      ReaderOrmEntity,
      ProcessedEventOrmEntity,
      ConsumerAggregateVersionOrmEntity,
      AgeVerificationOrmEntity,
      SocialMediaLinkOrmEntity,
    ]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
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
      provide: PROVIDERS_TOKENS.READER_REPOSITORY,
      useClass: TypeOrmReaderRepository,
    },
    {
      provide: PROVIDERS_TOKENS.AGE_VERIFICATION_REPOSITORY,
      useClass: TypeOrmAgeVerificationRepository,
    },
    {
      provide: PROVIDERS_TOKENS.SOCIAL_MEDIA_LINK_REPOSITORY,
      useClass: TypeOrmSocialMediaLinkRepository,
    },
    {
      provide: PROVIDERS_TOKENS.STORAGE,
      useClass: AwsS3StorageAdapter,
    },
    {
      provide: PROVIDERS_TOKENS.IMAGE_PROCESSOR,
      useClass: SharpImageProcessorAdapter,      
    },
    {
      provide: GetReaderUseCase,
      inject: [
        PROVIDERS_TOKENS.READER_REPOSITORY,
        PROVIDERS_TOKENS.AGE_VERIFICATION_REPOSITORY,
        PROVIDERS_TOKENS.SOCIAL_MEDIA_LINK_REPOSITORY,
        PROVIDERS_TOKENS.STORAGE,
      ],
      useFactory: (
        readers: ReaderRepositoryPort,
        ageVerification: AgeVerificationRepositoryPort,
        socialMediaLinks: SocialmediaLinkRepositoryPort,
        storage: StoragePort
      ) => 
        new GetReaderUseCase(
          readers,
          ageVerification,
          socialMediaLinks,
          storage
        )
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
    {
      provide: UploadReaderImageUseCase,
      inject: [
        PROVIDERS_TOKENS.READER_REPOSITORY,
        PROVIDERS_TOKENS.IMAGE_PROCESSOR,
        PROVIDERS_TOKENS.STORAGE,
      ],
      useFactory: (
        readers: ReaderRepositoryPort,
        imageProcessor: ImageProcessorPort,
        storage: StoragePort,
      ) =>
        new UploadReaderImageUseCase(
          readers,
          imageProcessor,
          storage,
        ),
    },
    {
      provide: UpdateReaderUseCase,
      inject: [
        PROVIDERS_TOKENS.CORE_UNIT_OF_WORK,
        PROVIDERS_TOKENS.STORAGE,
      ],
      useFactory: (
        unitOfWork: CoreUnitOfWorkPort,
        storage: StoragePort,
      ) => 
        new UpdateReaderUseCase(
        unitOfWork,
        storage,
      ),
    },
    RabbitMqRetryProvider,
    AuthTokenGuard,
  ],
  exports: [
    PROVIDERS_TOKENS.CORE_UNIT_OF_WORK
  ]
})
export class ReaderModule {}