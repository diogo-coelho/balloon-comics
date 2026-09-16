import { UserCreatedEvent } from "../../domain/user/events/user-created.event";
import { TypeOrmOutboxRepository } from "../persistence/typeorm/repositories/typeorm-outbox.repository";

describe("TypeOrmOutboxRepository", () => {
  it("deve persistir evento pendente no outbox", async () => {
    const repository = { create: jest.fn((value) => value), save: jest.fn() };
    const adapter = new TypeOrmOutboxRepository(repository as never);
    const event = new UserCreatedEvent("user-id", 1, { userId: "user-id", username: "ana", email: "ana@example.com" });

    await adapter.save(event);

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ id: event.eventId, status: "pending", attempts: 0 }));
    expect(repository.save).toHaveBeenCalled();
  });
});