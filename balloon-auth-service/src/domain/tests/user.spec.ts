import { User } from '../user/entities/user';

describe('Entidade User', () => {
  it('deve criar um usuário com versão inicial e datas', () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.eventVersion).toBe(1);
    expect(user.username).toBe('ana');
    expect(user.createdAt).toEqual(user.updatedAt);
  });

  it('deve atualizar dados de integração e incrementar a versão', () => {
    const user = new User(
      'id',
      'ana',
      'ana@example.com',
      'hash',
      1,
      new Date(0),
      new Date(0),
    );

    expect(user.update({ username: 'bia' })).toBe(true);
    expect(user.username).toBe('bia');
    expect(user.eventVersion).toBe(2);
    expect(user.updatedAt.getTime()).toBeGreaterThan(0);
  });

  it('não deve alterar a versão quando os dados permanecem iguais', () => {
    const user = new User(
      'id',
      'ana',
      'ana@example.com',
      'hash',
      3,
      new Date(0),
      new Date(0),
    );

    expect(user.update({ username: 'ana', email: 'ana@example.com' })).toBe(
      false,
    );
    expect(user.eventVersion).toBe(3);
  });

  it('deve alterar e limpar o hash do refresh token', () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });

    user.setRefreshTokenHash('refresh-hash');
    expect(user.getRefreshTokenHash()).toBe('refresh-hash');
    user.clearRefreshTokenHash();
    expect(user.getRefreshTokenHash()).toBeNull();
  });

  it('deve alterar o hash da senha', () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'old',
    });

    user.changePasswordHash('new');

    expect(user.passwordHash).toBe('new');
  });
});
