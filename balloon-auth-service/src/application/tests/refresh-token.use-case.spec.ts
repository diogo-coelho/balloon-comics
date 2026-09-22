import { RefreshTokenUseCase } from '../auth/use-cases/refresh-token.use-case';
import { User } from '../../domain/user/entities/user';
import InvalidRefreshTokenError from '../../domain/auth/errors/invalid-refresh-token.error';
import { AuthUnitOfWorkPort } from '../ports/auth-unit-of-work.port';
import { AuthTransactionalPort } from '../types/auth';

const makeTransaction = (user: User | null): AuthTransactionalPort => ({
  users: {
    findByIdForUpdate: jest.fn().mockResolvedValue(user),
    save: jest.fn(),
  },
  outbox: { save: jest.fn() },
});

describe('RefreshTokenUseCase', () => {
  it('deve renovar refresh token válido', async () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    user.setRefreshTokenHash('old-hash');
    const currentTransaction = makeTransaction(user);
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };
    const hasher = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('new-hash'),
    };
    const tokens = {
      verify: jest
        .fn()
        .mockResolvedValue({ sub: user.id, tokenType: 'refresh' }),
      generateAccessToken: jest.fn().mockResolvedValue('access'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh'),
    };

    await expect(
      new RefreshTokenUseCase(unitOfWork, hasher, tokens).execute({
        refreshToken: 'old',
      }),
    ).resolves.toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    const userSave = currentTransaction.users.save;
    expect(userSave).toHaveBeenCalledWith(user);
  });

  it('deve rejeitar token inválido, tipo incorreto e hash divergente', async () => {
    await expect(
      new RefreshTokenUseCase(
        { execute: jest.fn() },
        {},
        { verify: jest.fn().mockRejectedValue(new Error('invalid')) },
      ).execute({ refreshToken: 'bad' }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    user.setRefreshTokenHash('stored');
    const currentTransaction = makeTransaction(user);
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };
    const tokens = {
      verify: jest
        .fn()
        .mockResolvedValue({ sub: user.id, tokenType: 'access' }),
    };
    await expect(
      new RefreshTokenUseCase(
        unitOfWork,
        { compare: jest.fn() },
        tokens,
      ).execute({ refreshToken: 'bad' }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    tokens.verify.mockResolvedValue({ sub: user.id, tokenType: 'refresh' });
    await expect(
      new RefreshTokenUseCase(
        unitOfWork,
        { compare: jest.fn().mockResolvedValue(false) },
        tokens,
      ).execute({ refreshToken: 'bad' }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    expect(user.getRefreshTokenHash()).toBeNull();
  });

  it('deve rejeitar usuário sem refresh token', async () => {
    const currentTransaction = makeTransaction(
      User.create({
        username: 'ana',
        email: 'ana@example.com',
        passwordHash: 'hash',
      }),
    );
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };
    const tokens = {
      verify: jest.fn().mockResolvedValue({ sub: 'id', tokenType: 'refresh' }),
    };

    await expect(
      new RefreshTokenUseCase(unitOfWork, {}, tokens).execute({
        refreshToken: 'token',
      }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
