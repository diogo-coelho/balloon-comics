import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ReaderService } from '../reader.service';
import { ReaderEntity } from '../entities/reader.entity';
import { ProcessedEventEntity } from '../entities/processed-event.entity';
import { RequestReaderDto } from '../dtos/request/upload-reader.dto';
import { IntegrationEvent } from '../../auth/dtos/request/integration-event.dto';
import { UserQueueDto } from '../dtos/request/user-queue.dto';

describe('ReaderService', () => {
  let readerService: ReaderService;
  let readerRepository: jest.Mocked<Repository<ReaderEntity>>;
  let dataSource: jest.Mocked<DataSource>;

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
  } as ReaderEntity;

  const event: IntegrationEvent<UserQueueDto> = {
    eventId: 'event-id',
    eventType: 'auth.user.created.v1',
    aggregateId: 'user-id',
    occurredAt: new Date().toISOString(),
    version: 1,
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
      ],
    }).compile();

    readerService = module.get(ReaderService);
    readerRepository = module.get(getRepositoryToken(ReaderEntity));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateReader', () => {
    const requestReaderDto: RequestReaderDto = {
      name: 'Novo nome',
      imageUrl: 'http://imagem.com/foto.png',
      description: 'Nova descrição',
    };

    it('deve retornar mensagem de sucesso e os dados atualizados do leitor', async () => {
      readerRepository.update.mockResolvedValue({} as any);
      readerRepository.findOneByOrFail.mockResolvedValue(reader);

      const result = await readerService.updateReader({
        userId: reader.userId,
        requestReaderDto,
      });

      expect(result.message).toBe('Leitor atualizado com sucesso');
      expect(result.data).toBe(reader);
    });

    it('deve atualizar o leitor filtrando pelo userId com os dados informados', async () => {
      readerRepository.update.mockResolvedValue({} as any);
      readerRepository.findOneByOrFail.mockResolvedValue(reader);

      await readerService.updateReader({
        userId: reader.userId,
        requestReaderDto,
      });

      expect(readerRepository.update).toHaveBeenCalledWith(
        { userId: reader.userId },
        expect.objectContaining(requestReaderDto),
      );
    });
  });

  describe('handleUserCreated', () => {
    it('deve criar o leitor via upsert quando o evento ainda não tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });

      await readerService.handleUserCreated(event);

      expect(manager.upsert).toHaveBeenCalledWith(
        ReaderEntity,
        expect.objectContaining({ userId: event.data.userId }),
        ['userId'],
      );
    });

    it('não deve reprocessar o evento quando ele já tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [] });

      await readerService.handleUserCreated(event);

      expect(manager.upsert).not.toHaveBeenCalled();
    });

    it('deve registrar o evento processado com o consumidor correto', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'x' }] });

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

      await readerService.handleUserUpdated(event);

      expect(manager.update).toHaveBeenCalledWith(
        ReaderEntity,
        { userId: event.data.userId },
        expect.objectContaining({
          email: event.data.email,
          username: event.data.username,
        }),
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

      await readerService.handleUserDeleted(event);

      expect(manager.delete).toHaveBeenCalledWith(ReaderEntity, {
        userId: event.data.userId,
      });
    });

    it('não deve reprocessar o evento quando ele já tiver sido processado', async () => {
      insertQueryBuilder.execute.mockResolvedValue({ raw: [] });

      await readerService.handleUserDeleted(event);

      expect(manager.delete).not.toHaveBeenCalled();
    });
  });
});
