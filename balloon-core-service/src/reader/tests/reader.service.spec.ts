import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { ReaderService } from '../reader.service';
import { ReaderEntity } from '../entities/reader.entity';
import { ProcessedEventEntity } from '../entities/processed-event.entity';
import { ConsumerAggregateVersionEntity } from '../entities/consumer-aggregate-version.entity';
import { UploadReaderDto } from '../dtos/request/upload-reader.dto';
import { IntegrationEvent } from '../../auth/dtos/request/integration-event.dto';
import { UserQueueDto } from '../dtos/request/user-queue.dto';
import { StorageService } from '../../storage/storage.service';
import { MediaService } from '../../media/media.service';
import { AgeVerificationService } from '../../age-verification/age-verification.service';
import { AgeVerificationEntity } from '../../age-verification/entities/age-verification.entity';
import { AgeVerificationMapper } from '../../age-verification/mappers/age-verification.mapper';
import { SocialMediaLinkEntity } from '../../social-media-link/entities/social-media-link.entity';
import { SocialMediaLinkMapper } from '../../social-media-link/mappers/social-media-link.mapper';
import { SocialMediaLinkService } from '../../social-media-link/social-media-link.service';

describe('ReaderService', () => {
  let readerService: ReaderService;
  let readerRepository: jest.Mocked<Repository<ReaderEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let storageService: jest.Mocked<StorageService>;
  let mediaService: jest.Mocked<MediaService>;
  let ageVerificationService: jest.Mocked<AgeVerificationService>;
  let ageVerificationMapper: jest.Mocked<AgeVerificationMapper>;
  let socialMediaLinkMapper: jest.Mocked<SocialMediaLinkMapper>;
  let socialMediaLinkService: jest.Mocked<SocialMediaLinkService>;

  let insertQueryBuilder: {
    insert: jest.Mock;
    into: jest.Mock;
    values: jest.Mock;
    orIgnore: jest.Mock;
    returning: jest.Mock;
    execute: jest.Mock;
  };

  let manager: {
    createQueryBuilder: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findOneByOrFail: jest.Mock;
    findOneOrFail: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
  };

  const reader: ReaderEntity = {
    id: 'reader-id',
    userId: 'user-id',
    email: 'usuario@teste.com',
    username: 'usuario',
    name: 'usuario',
    imageUrl: undefined,
    description: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const event: IntegrationEvent<UserQueueDto> = {
    eventId: 'event-id',
    eventType: 'auth.user.created.v1',
    aggregateId: 'user-id',
    occurredAt: new Date().toISOString(),
    version: 1,
    aggregateVersion: 1,
    data: {
      userId: 'user-id',
      username: 'usuario',
      email: 'usuario@teste.com',
    },
  };

  beforeEach(async () => {
    insertQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    manager = {
      createQueryBuilder: jest.fn(() => insertQueryBuilder),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneByOrFail: jest.fn(),
      findOneOrFail: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReaderService,
        {
          provide: getRepositoryToken(ReaderEntity),
          useValue: {
            update: jest.fn(),
            findOneByOrFail: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((callback: any) => callback(manager)),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            getPublicUrl: jest.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: {
            processImage: jest.fn(),
          },
        },
        {
          provide: AgeVerificationService,
          useValue: {
            hasLegalAge: jest.fn().mockReturnValue(true),
            getAgeVerificationByReaderId: jest.fn(),
          },
        },
        {
          provide: AgeVerificationMapper,
          useValue: {
            toModelFromEntity: jest.fn(),
          },
        },
        {
          provide: SocialMediaLinkMapper,
          useValue: {
            toModelFromEntity: jest.fn(),
          },
        },
        {
          provide: SocialMediaLinkService,
          useValue: {
            getSocialMediaLinksByReaderId: jest.fn(),
          },
        },
      ],
    }).compile();

    readerService = module.get(ReaderService);
    readerRepository = module.get(getRepositoryToken(ReaderEntity));
    dataSource = module.get(DataSource);
    storageService = module.get(StorageService);
    mediaService = module.get(MediaService);
    ageVerificationService = module.get(AgeVerificationService);
    ageVerificationMapper = module.get(AgeVerificationMapper);
    socialMediaLinkMapper = module.get(SocialMediaLinkMapper);
    socialMediaLinkService = module.get(SocialMediaLinkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReader', () => {
    it('deve retornar o leitor com a verificação de idade e as redes sociais mapeadas', async () => {
      const mappedAgeVerification = {
        id: 'age-verification-id',
        readerId: reader.id,
        hasLegalAge: true,
        dateOfBirth: new Date('2000-01-01'),
      };
      const mappedSocialMediaLinks = [
        {
          id: 'social-media-link-id',
          readerId: reader.id,
          name: 'facebook',
          url: 'https://facebook.com/usuario',
        },
      ];
      readerRepository.findOneByOrFail.mockResolvedValue(reader);
      storageService.getPublicUrl.mockReturnValue(
        'https://cdn.balloon.com/readers/imagem.png',
      );
      ageVerificationService.getAgeVerificationByReaderId.mockResolvedValue(
        mappedAgeVerification as any,
      );
      socialMediaLinkService.getSocialMediaLinksByReaderId.mockResolvedValue(
        mappedSocialMediaLinks as any,
      );

      const result = await readerService.getReader(reader.userId);

      expect(readerRepository.findOneByOrFail).toHaveBeenCalledWith({
        userId: reader.userId,
      });
      expect(
        ageVerificationService.getAgeVerificationByReaderId,
      ).toHaveBeenCalledWith(reader);
      expect(
        socialMediaLinkService.getSocialMediaLinksByReaderId,
      ).toHaveBeenCalledWith(reader);
      expect(result.message).toBe('Leitor recuperado com sucesso');
      expect(result.data).toEqual(
        expect.objectContaining({
          id: reader.id,
          imageUrl: 'https://cdn.balloon.com/readers/imagem.png',
          ageVerification: mappedAgeVerification,
          socialMediaLinks: mappedSocialMediaLinks,
        }),
      );
    });

    it('deve retornar undefined para verificação de idade e redes sociais quando não existirem', async () => {
      readerRepository.findOneByOrFail.mockResolvedValue(reader);
      storageService.getPublicUrl.mockReturnValue(
        'https://cdn.balloon.com/readers/imagem.png',
      );
      ageVerificationService.getAgeVerificationByReaderId.mockResolvedValue(
        null,
      );
      socialMediaLinkService.getSocialMediaLinksByReaderId.mockResolvedValue(
        [],
      );

      const result = await readerService.getReader(reader.userId);

      expect(result.data.ageVerification).toBeUndefined();
      expect(result.data.socialMediaLinks).toEqual([]);
    });
  });

  describe('updateReader', () => {
    const uploadReaderDto: UploadReaderDto = {
      name: 'Novo nome',
      description: 'Nova descrição',
    };

    it('deve retornar mensagem de sucesso e os dados atualizados do leitor', async () => {
      manager.findOneByOrFail.mockResolvedValue(reader);

      const result = await readerService.updateReader({
        userId: reader.userId,
        uploadReaderDto,
      });

      expect(result.message).toBe('Leitor atualizado com sucesso');
      expect(result.data).toEqual(
        expect.objectContaining({
          ...reader,
          ageVerification: null,
          socialMediaLink: null,
        }),
      );
    });

    it('deve atualizar o leitor filtrando pelo userId com os dados informados', async () => {
      manager.findOneByOrFail.mockResolvedValue(reader);

      await readerService.updateReader({
        userId: reader.userId,
        uploadReaderDto,
      });

      expect(manager.update).toHaveBeenCalledWith(
        ReaderEntity,
        { userId: reader.userId },
        expect.objectContaining(uploadReaderDto),
      );
    });

    it('deve criar a verificação de idade e retorná-la mapeada quando informada no payload', async () => {
      const ageVerification = {
        id: 'age-verification-id',
        reader,
        hasLegalAge: true,
        dateOfBirth: new Date('2000-01-01'),
      };
      const mappedAgeVerification = {
        id: 'age-verification-id',
        readerId: reader.id,
        hasLegalAge: true,
        dateOfBirth: new Date('2000-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      manager.findOneByOrFail.mockResolvedValue(reader);
      manager.upsert.mockResolvedValue({} as any);
      manager.findOneOrFail.mockResolvedValue(ageVerification);
      ageVerificationMapper.toModelFromEntity.mockReturnValue(
        mappedAgeVerification,
      );

      const result = await readerService.updateReader({
        userId: reader.userId,
        uploadReaderDto: {
          ...uploadReaderDto,
          ageVerification: { dateOfBirth: '2000-01-01' },
        },
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        AgeVerificationEntity,
        expect.objectContaining({
          reader,
          hasLegalAge: true,
          dateOfBirth: '2000-01-01',
        }),
        {
          conflictPaths: ['reader'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
      expect(manager.findOneOrFail).toHaveBeenCalledWith(
        AgeVerificationEntity,
        {
          where: { reader: { id: reader.id } },
          relations: { reader: true },
        },
      );
      expect(result.data.ageVerification).toBe(mappedAgeVerification);
    });

    it('deve criar as redes sociais e retorná-las mapeadas quando informadas no payload', async () => {
      const socialMediaLinks = [
        {
          id: 'social-media-link-id',
          reader,
          name: 'facebook',
          url: 'https://facebook.com/usuario',
        },
      ];
      const mappedSocialMediaLink = {
        id: 'social-media-link-id',
        readerId: reader.id,
        name: 'facebook',
        url: 'https://facebook.com/usuario',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      manager.findOneByOrFail.mockResolvedValue(reader);
      manager.upsert.mockResolvedValue({} as any);
      manager.find.mockResolvedValue(socialMediaLinks);
      socialMediaLinkMapper.toModelFromEntity.mockReturnValue(
        mappedSocialMediaLink,
      );

      const result = await readerService.updateReader({
        userId: reader.userId,
        uploadReaderDto: {
          ...uploadReaderDto,
          socialMediaLinks: [
            { name: 'facebook', url: 'https://facebook.com/usuario' },
          ],
        },
      });

      expect(manager.upsert).toHaveBeenCalledWith(
        SocialMediaLinkEntity,
        expect.arrayContaining([
          expect.objectContaining({
            name: 'facebook',
            url: 'https://facebook.com/usuario',
          }),
        ]),
        {
          conflictPaths: ['reader', 'name'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
      expect(manager.find).toHaveBeenCalledWith(SocialMediaLinkEntity, {
        where: {
          reader: { id: reader.id },
          name: In(['facebook']),
        },
        relations: { reader: true },
      });
      expect(result.data.socialMediaLink).toEqual([mappedSocialMediaLink]);
    });

    it('deve encapsular erros lançados durante a atualização em uma mensagem padrão', async () => {
      manager.findOneByOrFail.mockRejectedValue(
        new Error('leitor não encontrado'),
      );

      await expect(
        readerService.updateReader({
          userId: reader.userId,
          uploadReaderDto,
        }),
      ).rejects.toThrow('Failed to update reader: leitor não encontrado');
    });
  });

  describe('uploadImageReader', () => {
    const file = {
      originalname: 'avatar.png',
      buffer: Buffer.from('conteudo'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    it('deve processar, enviar a imagem e atualizar a url do leitor', async () => {
      const processedImage = { ...file, buffer: Buffer.from('processado') };
      mediaService.processImage.mockResolvedValue(processedImage);
      storageService.uploadFile.mockResolvedValue('readers/chave-gerada');
      storageService.getPublicUrl.mockReturnValue(
        'https://cdn.balloon.com/readers/chave-gerada',
      );
      readerRepository.update.mockResolvedValue({} as any);
      readerRepository.findOneByOrFail.mockResolvedValue({
        ...reader,
        imageUrl: 'readers/chave-gerada',
      });

      const result = await readerService.uploadImageReader(reader.userId, file);

      expect(storageService.uploadFile).toHaveBeenCalledWith(
        processedImage,
        'readers',
      );
      expect(readerRepository.update).toHaveBeenCalledWith(
        { userId: reader.userId },
        expect.objectContaining({ imageUrl: 'readers/chave-gerada' }),
      );
      expect(result.message).toBe('Imagem do leitor atualizada com sucesso');
      expect(result.data?.imageUrl).toBe(
        'https://cdn.balloon.com/readers/chave-gerada',
      );
    });
  });

  describe('handleUserCreated', () => {
    it('deve criar o leitor via upsert quando o evento ainda não tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 0,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);
      manager.save.mockResolvedValue(aggregateState);

      await readerService.handleUserCreated(event);

      expect(manager.upsert).toHaveBeenCalledWith(
        ReaderEntity,
        expect.objectContaining({ userId: event.data.userId }),
        ['userId'],
      );
      expect(aggregateState.lastAppliedVersion).toBe(1);
      expect(manager.save).toHaveBeenCalledWith(
        ConsumerAggregateVersionEntity,
        aggregateState,
      );
    });

    it('não deve reprocessar o evento quando ele já tiver sido processado pelo eventId', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [] });

      await readerService.handleUserCreated(event);

      expect(manager.upsert).not.toHaveBeenCalled();
      expect(manager.findOneOrFail).not.toHaveBeenCalled();
    });

    it('não deve processar quando a versão do evento for menor ou igual à já aplicada', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 1,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);

      await readerService.handleUserCreated(event);

      expect(manager.upsert).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o evento chegar fora de ordem (sequência com gap)', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 0,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);

      const outOfOrderEvent = { ...event, aggregateVersion: 3 };

      await expect(
        readerService.handleUserCreated(outOfOrderEvent),
      ).rejects.toThrow(/Evento fora de ordem/);
      expect(manager.upsert).not.toHaveBeenCalled();
    });

    it('deve registrar o evento processado com o consumidor correto', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 0,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);
      manager.save.mockResolvedValue(aggregateState);

      await readerService.handleUserCreated(event);

      expect(insertQueryBuilder.into).toHaveBeenCalledWith(
        ProcessedEventEntity,
      );
      expect(insertQueryBuilder.values).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: event.eventId,
          consumer: 'reader-sync',
        }),
      );
    });
  });

  describe('handleUserUpdated', () => {
    it('deve atualizar o leitor quando o evento ainda não tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 0,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);
      manager.save.mockResolvedValue(aggregateState);

      await readerService.handleUserUpdated(event);

      expect(manager.update).toHaveBeenCalledWith(
        ReaderEntity,
        { userId: event.data.userId },
        expect.objectContaining({
          email: event.data.email,
          username: event.data.username,
        }),
      );
      expect(aggregateState.lastAppliedVersion).toBe(1);
      expect(manager.save).toHaveBeenCalledWith(
        ConsumerAggregateVersionEntity,
        aggregateState,
      );
    });

    it('não deve reprocessar o evento quando ele já tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [] });

      await readerService.handleUserUpdated(event);

      expect(manager.update).not.toHaveBeenCalled();
    });
  });

  describe('handleUserDeleted', () => {
    it('deve remover o leitor quando o evento ainda não tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });
      const aggregateState = {
        aggregateId: event.aggregateId,
        consumer: 'reader-sync',
        lastAppliedVersion: 0,
      };
      manager.findOneOrFail.mockResolvedValue(aggregateState);
      manager.save.mockResolvedValue(aggregateState);

      await readerService.handleUserDeleted(event);

      expect(manager.delete).toHaveBeenCalledWith(ReaderEntity, {
        userId: event.data.userId,
      });
      expect(aggregateState.lastAppliedVersion).toBe(1);
      expect(manager.save).toHaveBeenCalledWith(
        ConsumerAggregateVersionEntity,
        aggregateState,
      );
    });

    it('não deve reprocessar o evento quando ele já tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [] });

      await readerService.handleUserDeleted(event);

      expect(manager.delete).not.toHaveBeenCalled();
    });
  });
});
