import { User } from '../../domain/user/entities/user';
import { UserOrmEntity } from '../persistence/typeorm/entities/user.orm-entity';
import { TypeOrmUserRepository } from '../persistence/typeorm/repositories/typeorm-user.repository';

describe('TypeOrmUserRepository', () => {
  it('deve consultar, salvar e excluir usuários', async () => {
    const entity = Object.assign(new UserOrmEntity(), {
      id: 'id',
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
      eventVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repository = {
      findOneBy: jest
        .fn()
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(null),
      findOne: jest.fn().mockResolvedValue(entity),
      save: jest.fn(),
      findOneByOrFail: jest.fn().mockResolvedValue(entity),
      delete: jest.fn(),
    };
    const adapter = new TypeOrmUserRepository(repository as never);

    expect(await adapter.findByEmail(entity.email)).toBeInstanceOf(User);
    await expect(adapter.findById('missing')).resolves.toBeNull();
    expect(await adapter.findByIdForUpdate(entity.id)).toBeInstanceOf(User);
    await adapter.save(
      new User(
        entity.id,
        entity.username,
        entity.email,
        entity.passwordHash,
        entity.eventVersion,
        entity.createdAt,
        entity.updatedAt,
      ),
    );
    await adapter.delete(
      new User(
        entity.id,
        entity.username,
        entity.email,
        entity.passwordHash,
        entity.eventVersion,
        entity.createdAt,
        entity.updatedAt,
      ),
    );

    expect(repository.save).toHaveBeenCalled();
    expect(repository.delete).toHaveBeenCalledWith({ id: entity.id });
  });
});
