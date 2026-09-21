import UserNotFoundError from '../../../domain/user/errors/user-not-found.error';
import { UserDeletedEvent } from '../../../domain/user/events/user-deleted.event';
import { AuthUnitOfWorkPort } from '../../ports/auth-unit-of-work.port';
import { DeleteUserInput } from '../../types/user';

export class DeleteUserUseCase {
  constructor(private readonly unitOfWork: AuthUnitOfWorkPort) {}

  async execute(input: DeleteUserInput): Promise<void> {
    await this.unitOfWork.execute(async (transaction) => {
      const user = await transaction.users.findByIdForUpdate(input.id);

      if (!user)
        throw new UserNotFoundError('Usuário não encontrado: ' + input.id);

      const deleteVersion = user.eventVersion + 1;

      await transaction.users.delete(user);

      await transaction.outbox.save(
        new UserDeletedEvent(user.id, deleteVersion, {
          userId: user.id,
        }),
      );
    });
  }
}
