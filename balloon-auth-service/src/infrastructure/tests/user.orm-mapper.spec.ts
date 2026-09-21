import { User } from '../../domain/user/entities/user';
import { UserOrmEntity } from '../persistence/typeorm/entities/user.orm-entity';
import { UserOrmMapper } from '../persistence/typeorm/mappers/user.orm-mapper';

describe('UserOrmMapper', () => {
  it('deve mapear usuário entre domínio e persistência', () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    user.setRefreshTokenHash('refresh-hash');

    const entity = UserOrmMapper.toPersistence(user);
    const restored = UserOrmMapper.toDomain(entity);

    expect(entity).toMatchObject({
      id: user.id,
      email: user.email,
      refreshTokenHash: 'refresh-hash',
    });
    expect(restored).toMatchObject({
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
    });
    expect(restored.getRefreshTokenHash()).toBe('refresh-hash');
  });
});
