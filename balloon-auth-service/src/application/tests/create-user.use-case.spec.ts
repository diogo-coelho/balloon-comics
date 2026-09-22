import { CreateUserUseCase } from '../user/use-cases/create-user.use-case';
import { User } from '../../domain/user/entities/user';
import EmailAlreadyInUseError from '../../domain/user/errors/email-already-in-use.error';
import { AuthUnitOfWorkPort } from '../ports/auth-unit-of-work.port';
import { AuthTransactionalPort } from '../types/auth';

const transaction = (
  existingUser: User | null = null,
): AuthTransactionalPort => ({
  users: {
    findByEmail: jest.fn().mockResolvedValue(existingUser),
    save: jest.fn(),
  },
  outbox: { save: jest.fn() },
});

describe('CreateUserUseCase', () => {
  it('deve criar usuário, evento e tokens', async () => {
    const currentTransaction = transaction();
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };
    const passwordHasher = {
      hash: jest
        .fn()
        .mockResolvedValueOnce('password-hash')
        .mockResolvedValueOnce('refresh-hash'),
    };
    const tokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
    };

    const result = await new CreateUserUseCase(
      unitOfWork,
      passwordHasher,
      tokenService,
    ).execute({
      username: 'ana',
      email: 'ana@example.com',
      password: 'secret',
    });

    expect(result.user.email).toBe('ana@example.com');
    expect(result.accessToken).toBe('access-token');
    const outboxSave = currentTransaction.outbox.save;
    const userSave = currentTransaction.users.save;
    expect(outboxSave).toHaveBeenCalled();
    expect(userSave).toHaveBeenCalledTimes(2);
  });

  it('deve rejeitar criação com email existente', async () => {
    const currentTransaction = transaction(
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

    await expect(
      new CreateUserUseCase(
        unitOfWork,
        { hash: jest.fn().mockResolvedValue('hash') },
        {},
      ).execute({
        username: 'ana',
        email: 'ana@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});
