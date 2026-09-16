import { CreateUserUseCase } from "../user/use-cases/create-user.use-case";
import { User } from "../../domain/user/entities/user";
import EmailAlreadyInUseError from "../../domain/user/errors/email-already-in-use.error";

const transaction = (existingUser: User | null = null) => ({
  users: { findByEmail: jest.fn().mockResolvedValue(existingUser), save: jest.fn() },
  outbox: { save: jest.fn() },
});

describe("CreateUserUseCase", () => {
  it("deve criar usuário, evento e tokens", async () => {
    const currentTransaction = transaction();
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };
    const passwordHasher = { hash: jest.fn().mockResolvedValueOnce("password-hash").mockResolvedValueOnce("refresh-hash") };
    const tokenService = { generateAccessToken: jest.fn().mockResolvedValue("access-token"), generateRefreshToken: jest.fn().mockResolvedValue("refresh-token") };

    const result = await new CreateUserUseCase(unitOfWork, passwordHasher, tokenService).execute({ username: "ana", email: "ana@example.com", password: "secret" });

    expect(result.user.email).toBe("ana@example.com");
    expect(result.accessToken).toBe("access-token");
    expect(currentTransaction.outbox.save).toHaveBeenCalled();
    expect(currentTransaction.users.save).toHaveBeenCalledTimes(2);
  });

  it("deve rejeitar criação com email existente", async () => {
    const currentTransaction = transaction(User.create({ username: "ana", email: "ana@example.com", passwordHash: "hash" }));
    const unitOfWork = { execute: jest.fn((operation) => operation(currentTransaction)) };

    await expect(new CreateUserUseCase(unitOfWork, { hash: jest.fn().mockResolvedValue("hash") }, {}).execute({ username: "ana", email: "ana@example.com", password: "secret" })).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});