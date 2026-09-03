import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AgeVerificationService } from '../age-verification.service';
import { AgeVerificationEntity } from '../entities/age-verification.entity';
import { AgeVerificationMapper } from '../mappers/age-verification.mapper';
import { CreateAgeVerificationDto } from '../dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from '../dtos/response/response-age-verification.dto';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('AgeVerificationService', () => {
  let service: AgeVerificationService;
  let repository: jest.Mocked<Repository<AgeVerificationEntity>>;
  let mapper: jest.Mocked<AgeVerificationMapper>;

  const reader = { id: 'reader-id' } as ReaderEntity;

  const ageVerification: AgeVerificationEntity = {
    id: 'age-verification-id',
    reader,
    hasLegalAge: true,
    dateOfBirth: new Date('2000-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AgeVerificationEntity;

  const responseDto: ResponseAgeVerificationDto = {
    id: ageVerification.id,
    readerId: reader.id,
    hasLegalAge: ageVerification.hasLegalAge,
    dateOfBirth: ageVerification.dateOfBirth,
    createdAt: ageVerification.createdAt,
    updatedAt: ageVerification.updatedAt,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgeVerificationService,
        {
          provide: getRepositoryToken(AgeVerificationEntity),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: AgeVerificationMapper,
          useValue: {
            toModelFromEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AgeVerificationService);
    repository = module.get(getRepositoryToken(AgeVerificationEntity));
    mapper = module.get(AgeVerificationMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAgeVerification', () => {
    const createAgeVerificationDto: CreateAgeVerificationDto = {
      dateOfBirth: '2000-01-01',
    };

    it('deve salvar a verificação de idade calculando se o leitor é maior de idade', async () => {
      repository.save.mockResolvedValue(ageVerification);
      mapper.toModelFromEntity.mockReturnValue(responseDto);

      const result = await service.createAgeVerification(
        reader.id,
        createAgeVerificationDto,
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          readerId: reader.id,
          hasLegalAge: true,
          dateOfBirth: createAgeVerificationDto.dateOfBirth,
        }),
      );
      expect(mapper.toModelFromEntity).toHaveBeenCalledWith(ageVerification);
      expect(result).toBe(responseDto);
    });
  });

  describe('getAgeVerificationByReaderId', () => {
    it('deve retornar o modelo mapeado quando a verificação de idade existir', async () => {
      repository.findOneBy.mockResolvedValue(ageVerification);
      mapper.toModelFromEntity.mockReturnValue(responseDto);

      const result = await service.getAgeVerificationByReaderId(reader);

      expect(repository.findOneBy).toHaveBeenCalledWith({ reader });
      expect(result).toBe(responseDto);
    });

    it('deve retornar null quando não houver verificação de idade para o leitor', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.getAgeVerificationByReaderId(reader);

      expect(result).toBeNull();
      expect(mapper.toModelFromEntity).not.toHaveBeenCalled();
    });
  });

  describe('hasLegalAge', () => {
    it('deve retornar true quando a idade já tiver sido completada este ano', () => {
      const today = new Date();
      const dateOfBirth = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate() - 1,
      ).toISOString();

      expect(service.hasLegalAge(dateOfBirth)).toBe(true);
    });

    it('deve retornar false quando o aniversário de 18 anos ainda não tiver ocorrido este ano', () => {
      const today = new Date();
      const dateOfBirth = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate() + 1,
      ).toISOString();

      expect(service.hasLegalAge(dateOfBirth)).toBe(false);
    });

    it('deve retornar false para menores de 18 anos', () => {
      const today = new Date();
      const dateOfBirth = new Date(
        today.getFullYear() - 10,
        today.getMonth(),
        today.getDate(),
      ).toISOString();

      expect(service.hasLegalAge(dateOfBirth)).toBe(false);
    });
  });
});
