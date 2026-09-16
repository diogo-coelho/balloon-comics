import { DeleteUserUseCase } from "../user/use-cases/delete-user.use-case";
import { User } from "../../domain/user/entities/user";
import UserNotFoundError from "../../domain/user/errors/user-not-found.error";

describe("DeleteUserUseCase", () => {
  it("deve excluir usuário e publicar evento", async () => {
    const user = User.create({ username: "ana", email: "ana@example.com", passwordHash: "hash" });
    const currentTransaction = { users: { findByIdForUpdate: jest.fn().mockResolvedValue(user), delete: jest.fn() }, outbox: { save: jest.fn() } };
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    await new DeleteUserUseCase(unitOfWork).execute({ id: user.id, requesterId: user.id });

    expect(currentTransaction.users.delete).toHaveBeenCalledWith(user);
    expect(currentTransaction.outbox.save).toHaveBeenCalled();
  });

  it("deve rejeitar exclusão de usuário inexistente", async () => {
    const currentTransaction = { users: { findByIdForUpdate: jest.fn().mockResolvedValue(null) }, outbox: { save: jest.fn() } };
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    await expect(new DeleteUserUseCase(unitOfWork).execute({ id: "missing", requesterId: "any" })).rejects.toBeInstanceOf(UserNotFoundError);
  });
});