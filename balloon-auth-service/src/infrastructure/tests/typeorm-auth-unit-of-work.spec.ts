import { TypeOrmAuthUnitOfWork } from "../persistence/typeorm/unit-of-work/typeorm-auth-unit-of-work";

describe("TypeOrmAuthUnitOfWork", () => {
  it("deve executar a operação dentro de uma transação", async () => {
    const transaction = jest.fn(async (operation) => operation({ getRepository: jest.fn().mockReturnValue({}) }));
    const unitOfWork = new TypeOrmAuthUnitOfWork({ transaction } as never);

    const result = await unitOfWork.execute(async (repositories) => {
      expect(repositories.users).toBeDefined();
      expect(repositories.outbox).toBeDefined();
      return "ok";
    });

    expect(result).toBe("ok");
    expect(transaction).toHaveBeenCalled();
  });
});