import { AuthUnitOfWorkPort } from "../../ports/auth-unit-of-work.port";
import { PasswordHasherPort } from "../../ports/password-hasher.port";
import { UpdateUserOutput } from "../../types/outbox-event";
import { UpdateUserInput } from "../../types/user";
import EmailAlreadyInUseError from "../../../domain/user/errors/email-already-in-use.error";
import { UserUpdatedEvent } from "../../../domain/user/events/user-updated.event";
import UserNotAllowedError from "../../../domain/user/errors/user-not-allowed.error";
import UserNotFoundError from "../../../domain/user/errors/user-not-found.error";

export class UpdateUserUseCase {
  constructor(
    private readonly unitOfWork: AuthUnitOfWorkPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}  

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const passwordHash = input.password ?
      await this.passwordHasher.hash(input.password) :
      undefined;

    return this.unitOfWork.execute(async (transaction) => {
      const user = await transaction.users.findByIdForUpdate(input.id);

      if (!user) throw new UserNotFoundError('Usuário não encontrado: ' + input.id);

      if (input.requesterId !== user.id) {
        throw new UserNotAllowedError('Usuário não autorizado a atualizar este usuário: ' + input.requesterId);
      }

      if (input.email && input.email !== user.email) {
        const existingUser = await transaction.users.findByEmail(input.email);

        if (existingUser && existingUser.id !== user.id) {
          throw new EmailAlreadyInUseError('Email já está em uso: ' + input.email);
        }
      }

      const integrationDataChanged = user.update({
        username: input.username,
        email: input.email,
      });

      if (passwordHash) {
        user.changePasswordHash(passwordHash);
      }

      await transaction.users.save(user);

      if (integrationDataChanged) {
        await transaction.outbox.save(
          new UserUpdatedEvent(
            user.id,
            user.eventVersion,
            {
              userId: user.id,
              username: user.username,
              email: user.email,
            }
          )
        )
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  }
}