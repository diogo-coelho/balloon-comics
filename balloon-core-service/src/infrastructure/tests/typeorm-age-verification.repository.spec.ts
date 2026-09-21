import { AgeVerification } from '../../domain/age-verification/entities/age-verification';
import { TypeOrmAgeVerificationRepository } from '../persistence/typeorm/repositories/typeorm-age-verification.repository';

describe('TypeOrmAgeVerificationRepository', () => {
  it('deve buscar e salvar verificação de idade no banco', async () => {
    const ageVerification = AgeVerification.create({
      readerId: 'reader-id',
      dateOfBirth: new Date('2000-05-10T00:00:00.000Z'),
      referenceDate: new Date('2026-09-17T00:00:00.000Z'),
    });

    const repository = {
      findOneBy: jest.fn().mockResolvedValue({
        id: ageVerification.id,
        reader: { id: 'reader-id' },
        dateOfBirth: ageVerification.dateOfBirth,
        hasLegalAge: ageVerification.hasLegalAge,
        createdAt: ageVerification.createdAt,
        updatedAt: ageVerification.updatedAt,
      }),
      save: jest.fn().mockResolvedValue(ageVerification),
    };

    const adapter = new TypeOrmAgeVerificationRepository(repository as any);

    const found = await adapter.findByReaderId('reader-id');
    const saved = await adapter.save(ageVerification);

    expect(found).toBeInstanceOf(AgeVerification);
    expect(found?.readerId).toBe('reader-id');
    expect(saved).toBe(ageVerification);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: ageVerification.id }),
    );
  });
});
