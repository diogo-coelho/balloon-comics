import { LogoutUseCase } from '../auth/use-cases/logout.use-case';
import { User } from '../../domain/user/entities/user';

describe('LogoutUseCase', () => {
  it('deve limpar o refresh token do usuário', async () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    user.setRefreshTokenHash('refresh-hash');
    const users = {
      findById: jest.fn().mockResolvedValue(user),
      save: jest.fn(),
    };

    await new LogoutUseCase(users).execute(user.id);

    expect(user.getRefreshTokenHash()).toBeNull();
    expect(users.save).toHaveBeenCalledWith(user);
  });

  it('deve ignorar logout de usuário inexistente', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    await expect(
      new LogoutUseCase(users).execute('missing'),
    ).resolves.toBeUndefined();
    expect(users.save).not.toHaveBeenCalled();
  });
});
