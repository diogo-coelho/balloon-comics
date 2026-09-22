import { DeleteUserUseCase } from '../user/use-cases/delete-user.use-case';
import { User } from '../../domain/user/entities/user';
import UserNotFoundError from '../../domain/user/errors/user-not-found.error';
import { AuthUnitOfWorkPort } from '../ports/auth-unit-of-work.port';
import { AuthTransactionalPort } from '../types/auth';

describe('DeleteUserUseCase', () => {
  it('deve excluir usuário e publicar evento', async () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    const currentTransaction: AuthTransactionalPort = {
      users: {
        findByIdForUpdate: jest.fn().mockResolvedValue(user),
        delete: jest.fn(),
      },
      outbox: { save: jest.fn() },
    };
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };

    await new DeleteUserUseCase(unitOfWork).execute({
      id: user.id,
      requesterId: user.id,
    });

    const userDelete = currentTransaction.users.delete;
    const outboxSave = currentTransaction.outbox.save;
    expect(userDelete).toHaveBeenCalledWith(user);
    expect(outboxSave).toHaveBeenCalled();
  });

  it('deve rejeitar exclusão de usuário inexistente', async () => {
    const currentTransaction: AuthTransactionalPort = {
      users: { findByIdForUpdate: jest.fn().mockResolvedValue(null) },
      outbox: { save: jest.fn() },
    };
    const unitOfWork: AuthUnitOfWorkPort = {
      execute: jest.fn(
        <T>(operation: (transaction: AuthTransactionalPort) => Promise<T>) =>
          operation(currentTransaction),
      ),
    };

    await expect(
      new DeleteUserUseCase(unitOfWork).execute({
        id: 'missing',
        requesterId: 'any',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
