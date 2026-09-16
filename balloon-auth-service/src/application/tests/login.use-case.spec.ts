import { LoginUseCase } from "../auth/use-cases/login.use-case";
import { User } from "../../domain/user/entities/user";
import InvalidCredentialsError from "../../domain/auth/errors/invalid-credentials.error";

describe("LoginUseCase", () => {
  it("deve autenticar credenciais válidas e salvar o refresh token", async () => {
    const user = User.create({ username: "ana", email: "ana@example.com", passwordHash: "hash" });
    const users = { findByEmail: jest.fn().mockResolvedValue(user), save: jest.fn() };
    const passwordHasher = { compare: jest.fn().mockResolvedValue(true), hash: jest.fn().mockResolvedValue("refresh-hash") };
    const tokenService = { generateAccessToken: jest.fn().mockResolvedValue("access"), generateRefreshToken: jest.fn().mockResolvedValue("refresh") };

    const result = await new LoginUseCase(users, passwordHasher, tokenService).execute({ email: user.email, password: "secret" });

    expect(result.user).toEqual({ id: user.id, email: user.email });
    expect(users.save).toHaveBeenCalledWith(user);
  });

  it("deve rejeitar email inexistente ou senha inválida", async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null), save: jest.fn() };
    const hasher = { compare: jest.fn(), hash: jest.fn() };
    await expect(new LoginUseCase(users, hasher, {}).execute({ email: "none", password: "secret" })).rejects.toBeInstanceOf(InvalidCredentialsError);

    const user = User.create({ username: "ana", email: "ana@example.com", passwordHash: "hash" });
    users.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(false);
    await expect(new LoginUseCase(users, hasher, {}).execute({ email: user.email, password: "wrong" })).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});