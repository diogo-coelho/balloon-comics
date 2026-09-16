import { UserController } from "../http/user/user.controller";
import { CreateUserUseCase } from "../../application/user/use-cases/create-user.use-case";
import { UpdateUserUseCase } from "../../application/user/use-cases/update-user.use-case";
import { DeleteUserUseCase } from "../../application/user/use-cases/delete-user.use-case";
import HttpCookies from "../http/cookies/http-cookies";

describe("UserController", () => {
  it("deve criar usuário, delegar os dados e configurar os cookies", async () => {
    const createUser = { execute: jest.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: "user-id", username: "ana", email: "ana@example.com", createdAt: new Date() },
    }) };
    const cookies = new HttpCookies();
    const response = { cookie: jest.fn() };
    const controller = new UserController(createUser as CreateUserUseCase, {} as UpdateUserUseCase, {} as DeleteUserUseCase, cookies);

    const result = await controller.create({ username: "ana", email: "ana@example.com", password: "secret" }, response as never);

    expect(createUser.execute).toHaveBeenCalledWith({ username: "ana", email: "ana@example.com", password: "secret" });
    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(result).toEqual(expect.objectContaining({ message: "Usuário criado com sucesso" }));
  });

  it("deve atualizar usuário usando o id do parâmetro e o solicitante do token", async () => {
    const updateUser = { execute: jest.fn().mockResolvedValue({ id: "user-id", username: "bia", email: "bia@example.com" }) };
    const controller = new UserController({} as CreateUserUseCase, updateUser as UpdateUserUseCase, {} as DeleteUserUseCase, {} as HttpCookies);

    const result = await controller.update("user-id", { sub: "requester-id", email: "ana@example.com" }, { username: "bia" });

    expect(updateUser.execute).toHaveBeenCalledWith({ id: "user-id", requesterId: "requester-id", username: "bia" });
    expect(result).toEqual({ message: "Usuário atualizado com sucesso", data: { user: { id: "user-id", username: "bia", email: "bia@example.com" } } });
  });

  it("deve excluir usuário usando o id do parâmetro e o solicitante do token", async () => {
    const deleteUser = { execute: jest.fn().mockResolvedValue(undefined) };
    const controller = new UserController({} as CreateUserUseCase, {} as UpdateUserUseCase, deleteUser as DeleteUserUseCase, {} as HttpCookies);

    const result = await controller.delete("user-id", { sub: "requester-id" });

    expect(deleteUser.execute).toHaveBeenCalledWith({ id: "user-id", requesterId: "requester-id" });
    expect(result).toEqual({ message: "Usuário deletado com sucesso" });
  });
});