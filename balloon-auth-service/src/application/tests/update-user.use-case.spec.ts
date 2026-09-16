import { UpdateUserUseCase } from "../user/use-cases/update-user.use-case";
import { User } from "../../domain/user/entities/user";
import EmailAlreadyInUseError from "../../domain/user/errors/email-already-in-use.error";
import UserNotAllowedError from "../../domain/user/errors/user-not-allowed.error";
import UserNotFoundError from "../../domain/user/errors/user-not-found.error";

const makeUser = () => User.create({ username: "ana", email: "ana@example.com", passwordHash: "stored" });
const makeTransaction = (user: User | null, emailUser: User | null = null) => ({
  users: { findByIdForUpdate: jest.fn().mockResolvedValue(user), findByEmail: jest.fn().mockResolvedValue(emailUser), save: jest.fn() },
  outbox: { save: jest.fn() },
});

describe("UpdateUserUseCase", () => {
  it("deve atualizar dados, senha e publicar evento quando necessário", async () => {
    const user = makeUser();
    const currentTransaction = makeTransaction(user);
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    const result = await new UpdateUserUseCase(unitOfWork, { hash: jest.fn().mockResolvedValue("new-hash") }).execute({ id: user.id, requesterId: user.id, username: "bia", password: "new-password" });

    expect(result.username).toBe("bia");
    expect(user.passwordHash).toBe("new-hash");
    expect(currentTransaction.outbox.save).toHaveBeenCalled();
  });

  it("deve atualizar somente a senha sem publicar evento de integração", async () => {
    const user = makeUser();
    const currentTransaction = makeTransaction(user);
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    await new UpdateUserUseCase(unitOfWork, { hash: jest.fn().mockResolvedValue("new-hash") }).execute({ id: user.id, requesterId: user.id, password: "new" });

    expect(currentTransaction.outbox.save).not.toHaveBeenCalled();
  });

  it("deve rejeitar usuário inexistente ou não autorizado", async () => {
    const missingUser = { execute: jest.fn((operation) => operation(makeTransaction(null))) };
    await expect(new UpdateUserUseCase(missingUser, { hash: jest.fn() }).execute({ id: "missing", requesterId: "requester" })).rejects.toBeInstanceOf(UserNotFoundError);

    const user = makeUser();
    const unauthorized = { execute: jest.fn((operation) => operation(makeTransaction(user))) };
    await expect(new UpdateUserUseCase(unauthorized, { hash: jest.fn() }).execute({ id: user.id, requesterId: "other" })).rejects.toBeInstanceOf(UserNotAllowedError);
  });

  it("deve rejeitar email usado por outro usuário", async () => {
    const user = makeUser();
    const other = new User("other", "bia", "bia@example.com", "hash", 1, new Date(), new Date());
    const currentTransaction = makeTransaction(user, other);
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    await expect(new UpdateUserUseCase(unitOfWork, { hash: jest.fn() }).execute({ id: user.id, requesterId: user.id, email: other.email })).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});