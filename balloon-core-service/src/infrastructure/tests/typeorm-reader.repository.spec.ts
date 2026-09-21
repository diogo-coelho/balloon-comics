import { Reader } from '../../domain/reader/entities/reader';
import { TypeOrmReaderRepository } from '../persistence/typeorm/repositories/typeorm-reader.repository';

describe('TypeOrmReaderRepository', () => {
  it('deve mapear, consultar e atualizar dados do leitor', async () => {
    const entity = {
      id: 'reader-id',
      userId: 'user-id',
      email: 'ana@example.com',
      username: 'ana',
      name: 'Ana',
      imageUrl: 'readers/avatar.png',
      description: 'Bio',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const repository = {
      upsert: jest.fn(),
      findOneBy: jest.fn().mockResolvedValue(entity),
      update: jest.fn(),
      findOne: jest.fn().mockResolvedValue(entity),
      delete: jest.fn(),
    };

    const adapter = new TypeOrmReaderRepository(repository as any);
    const reader = Reader.create({
      userId: 'user-id',
      username: 'ana',
      email: 'ana@example.com',
    });

    await adapter.upsert(reader);
    const result = await adapter.findByUserId('user-id');
    await adapter.synchronizeUserData({
      userId: 'user-id',
      username: 'ana.souza',
      email: 'ana.souza@example.com',
    });
    await adapter.updateImageUrl('user-id', 'readers/new-avatar.png');
    await adapter.deleteByUserId('user-id');

    expect(repository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-id', email: 'ana@example.com' }),
      { conflictPaths: ['userId'] },
    );
    expect(result).toBeInstanceOf(Reader);
    expect(result?.username).toBe('ana');
    expect(repository.update).toHaveBeenCalledTimes(2);
    expect(repository.delete).toHaveBeenCalledWith({ userId: 'user-id' });
  });
});
