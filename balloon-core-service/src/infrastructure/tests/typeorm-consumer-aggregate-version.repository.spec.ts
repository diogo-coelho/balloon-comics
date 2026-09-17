import { TypeOrmConsumerAggregateVersionRepository } from "../persistence/typeorm/repositories/typeorm-consumer-aggregate-version.repository";

describe("TypeOrmConsumerAggregateVersionRepository", () => {
  it("deve criar ou recuperar o estado do agregado e atualizar a versão", async () => {
    const entity = { aggregateId: "user-id", consumer: "reader-sync", lastAppliedVersion: 1 };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      }),
      findOneOrFail: jest.fn().mockResolvedValue(entity),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const adapter = new TypeOrmConsumerAggregateVersionRepository(repository as any);

    const state = await adapter.getOrCreateForUpdate("user-id", "reader-sync");
    await adapter.updateVersion("user-id", "reader-sync", 2);

    expect(state).toEqual({ aggregateId: "user-id", consumer: "reader-sync", lastAppliedVersion: 1 });
    expect(repository.update).toHaveBeenCalledWith({ aggregateId: "user-id", consumer: "reader-sync" }, { lastAppliedVersion: 2, updatedAt: expect.any(Date) });
  });
});
