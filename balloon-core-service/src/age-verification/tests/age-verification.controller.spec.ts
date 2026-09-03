import { Test, TestingModule } from '@nestjs/testing';

import { AgeVerificationController } from '../age-verification.controller';
import { AgeVerificationService } from '../age-verification.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { CreateAgeVerificationDto } from '../dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from '../dtos/response/response-age-verification.dto';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('AgeVerificationController', () => {
  let controller: AgeVerificationController;
  let service: jest.Mocked<AgeVerificationService>;

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
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get(AgeVerificationController);
    service = module.get(AgeVerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAgeVerification', () => {
    it('deve delegar a criação da verificação de idade para o AgeVerificationService', async () => {
      const createAgeVerificationDto: CreateAgeVerificationDto = {
        dateOfBirth: '2000-01-01',
      };
      service.createAgeVerification.mockResolvedValue(responseDto);

      const result = await controller.createAgeVerification(
        'reader-id',
        createAgeVerificationDto,
      );

      expect(service.createAgeVerification).toHaveBeenCalledWith(
        'reader-id',
        createAgeVerificationDto,
      );
      expect(result).toBe(responseDto);
    });
  });

  describe('getAgeVerificationByReaderId', () => {
    it('deve delegar a busca pela verificação de idade a partir do id do leitor', async () => {
      service.getAgeVerificationByReaderId.mockResolvedValue(responseDto);

      const result = await controller.getAgeVerificationByReaderId('reader-id');

      expect(service.getAgeVerificationByReaderId).toHaveBeenCalledWith(
        { id: 'reader-id' } as ReaderEntity,
      );
      expect(result).toBe(responseDto);
    });
  });
});
