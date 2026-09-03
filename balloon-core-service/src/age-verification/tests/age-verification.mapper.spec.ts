import { AgeVerificationMapper } from '../mappers/age-verification.mapper';
import { AgeVerificationEntity } from '../entities/age-verification.entity';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('AgeVerificationMapper', () => {
  let mapper: AgeVerificationMapper;

  beforeEach(() => {
    mapper = new AgeVerificationMapper();
  });

  describe('toModelFromEntity', () => {
    it('deve mapear a entidade de verificação de idade para o modelo de resposta', () => {
      const ageVerification: AgeVerificationEntity = {
        id: 'age-verification-id',
        reader: { id: 'reader-id' } as ReaderEntity,
        hasLegalAge: true,
        dateOfBirth: new Date('2000-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as AgeVerificationEntity;

      const result = mapper.toModelFromEntity(ageVerification, true);

      expect(result).toEqual({
        id: ageVerification.id,
        readerId: ageVerification.reader.id,
        hasLegalAge: ageVerification.hasLegalAge,
        dateOfBirth: ageVerification.dateOfBirth,
        createdAt: ageVerification.createdAt,
        updatedAt: ageVerification.updatedAt,
      });
    });
  });
});
