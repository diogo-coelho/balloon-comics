import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AgeVerificationController } from '../age-verification.controller';
import { AgeVerificationService } from '../age-verification.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { CreateAgeVerificationDto } from '../dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from '../dtos/response/response-age-verification.dto';
import { ReaderEntity } from '../../reader/entities/reader.entity';
import { TokenPayloadDto } from '../../auth/dtos/request/token-payload.dto';

describe('AgeVerificationController', () => {
  let controller: AgeVerificationController;
  let service: jest.Mocked<AgeVerificationService>;
  let readerRepository: jest.Mocked<Repository<ReaderEntity>>;

  const tokenPayload: TokenPayloadDto = {
    sub: 'user-id',
    email: 'user@teste.com',
    username: 'testuser',
  };

  const reader: ReaderEntity = {
    id: 'reader-id',
    userId: 'user-id',
    email: 'user@teste.com',
    username: 'testuser',
    name: 'testuser',
    imageUrl: undefined,
    description: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const responseDto: ResponseAgeVerificationDto = {
    id: 'age-verification-id',
    readerId: 'reader-id',
    hasLegalAge: true,
    dateOfBirth: new Date('2000-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeVerificationController],
      providers: [
        {
          provide: AgeVerificationService,
          useValue: {
            createAgeVerification: jest.fn(),
            getAgeVerificationByReaderId: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReaderEntity),
          useValue: {
            findOneByOrFail: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get(AgeVerificationController);
    service = module.get(AgeVerificationService);
    readerRepository = module.get(getRepositoryToken(ReaderEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAgeVerification', () => {
    it('deve delegar a criação da verificação de idade para o AgeVerificationService', async () => {
      const createAgeVerificationDto: CreateAgeVerificationDto = {
        dateOfBirth: '2000-01-01',
      };
      readerRepository.findOneByOrFail.mockResolvedValue(reader);
      service.createAgeVerification.mockResolvedValue(responseDto);

      const result = await controller.createAgeVerification(
        tokenPayload,
        createAgeVerificationDto,
      );

      expect(readerRepository.findOneByOrFail).toHaveBeenCalledWith({
        userId: 'user-id',
      });
      expect(service.createAgeVerification).toHaveBeenCalledWith(
        'reader-id',
        createAgeVerificationDto,
      );
      expect(result).toBe(responseDto);
    });
  });

  describe('getAgeVerificationByReaderId', () => {
    it('deve delegar a busca pela verificação de idade a partir do id do leitor', async () => {
      readerRepository.findOneByOrFail.mockResolvedValue(reader);
      service.getAgeVerificationByReaderId.mockResolvedValue(responseDto);

      const result = await controller.getAgeVerificationByReaderId(tokenPayload);

      expect(readerRepository.findOneByOrFail).toHaveBeenCalledWith({
        userId: 'user-id',
      });
      expect(service.getAgeVerificationByReaderId).toHaveBeenCalledWith({
        id: 'reader-id',
      } as ReaderEntity);
      expect(result).toBe(responseDto);
    });
  });
});
