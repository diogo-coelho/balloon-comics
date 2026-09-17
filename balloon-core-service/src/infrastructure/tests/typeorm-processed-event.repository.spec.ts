import { TypeOrmProcessedEventRepository } from "../persistence/typeorm/repositories/typeorm-processed-event.repository";

describe("TypeOrmProcessedEventRepository", () => {
  it("deve marcar evento como processado quando há inserção válida", async () => {
    const queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [{ id: "processed-id" }] }),
    };

    const repository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
    const adapter = new TypeOrmProcessedEventRepository(repository as any);

    const result = await adapter.tryMarkAsProcessed("event-id", "reader-sync");

    expect(result).toBe(true);
    expect(queryBuilder.values).toHaveBeenCalledWith({ eventId: "event-id", consumer: "reader-sync" });
  });

  it("deve retornar false quando o evento já foi processado", async () => {
    const queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [] }),
    };

    const repository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
    const adapter = new TypeOrmProcessedEventRepository(repository as any);

    await expect(adapter.tryMarkAsProcessed("event-id", "reader-sync")).resolves.toBe(false);
  });
});
