import { ReaderConsumer } from "../../infrastructure/messaging/rabbit-mq/consumers/readers/reader.consume";

describe("ReaderConsumer", () => {
  it("deve processar uma mensagem de criação do usuário e confirmar o ACK", async () => {
    const createReader = { execute: jest.fn().mockResolvedValue(undefined) };
    const updateReader = { execute: jest.fn() };
    const deleteReader = { execute: jest.fn() };
    const retryProvider = { publishRetry: jest.fn() };
    const configService = { getOrThrow: jest.fn().mockReturnValue(3) };

    const message = { properties: { headers: {} }, fields: { routingKey: "reader.created" } } as any;
    const channel = { ack: jest.fn(), nack: jest.fn() } as any;
    const context = { getChannelRef: jest.fn().mockReturnValue(channel), getMessage: jest.fn().mockReturnValue(message) } as any;

    const consumer = new ReaderConsumer(createReader as any, updateReader as any, deleteReader as any, retryProvider as any, configService as any);

    await consumer.userCreated({ eventId: "evt-1", aggregateId: "user-1", aggregateVersion: 1, data: { userId: "user-1", username: "ana", email: "ana@example.com" } }, context);

    expect(createReader.execute).toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it("deve publicar retry e confirmar mensagem quando o handler falha e há retries disponíveis", async () => {
    const createReader = { execute: jest.fn().mockRejectedValue(new Error("erro de processamento")) };
    const updateReader = { execute: jest.fn() };
    const deleteReader = { execute: jest.fn() };
    const retryProvider = { publishRetry: jest.fn().mockResolvedValue(undefined) };
    const configService = { getOrThrow: jest.fn().mockReturnValue(2) };

    const message = {
      properties: { headers: { "x-retry-count": 0 }, messageId: "msg-1", type: "user.created", contentType: "application/json" },
      fields: { routingKey: "reader.created" },
      content: Buffer.from("payload"),
    } as any;
    const channel = { ack: jest.fn(), nack: jest.fn() } as any;
    const context = { getChannelRef: jest.fn().mockReturnValue(channel), getMessage: jest.fn().mockReturnValue(message) } as any;

    const consumer = new ReaderConsumer(createReader as any, updateReader as any, deleteReader as any, retryProvider as any, configService as any);

    await consumer.userCreated({ eventId: "evt-err", aggregateId: "user-1", aggregateVersion: 1, data: { userId: "user-1", username: "ana", email: "ana@example.com" } }, context);

    expect(retryProvider.publishRetry).toHaveBeenCalledWith(message, 1);
    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it("deve nack a mensagem quando excede o limite de retries", async () => {
    const createReader = { execute: jest.fn().mockRejectedValue(new Error("erro persistente")) };
    const updateReader = { execute: jest.fn() };
    const deleteReader = { execute: jest.fn() };
    const retryProvider = { publishRetry: jest.fn().mockResolvedValue(undefined) };
    const configService = { getOrThrow: jest.fn().mockReturnValue(1) };

    const message = {
      properties: { headers: { "x-retry-count": 1 }, messageId: "msg-2", type: "user.created", contentType: "application/json" },
      fields: { routingKey: "reader.created" },
      content: Buffer.from("payload"),
    } as any;
    const channel = { ack: jest.fn(), nack: jest.fn() } as any;
    const context = { getChannelRef: jest.fn().mockReturnValue(channel), getMessage: jest.fn().mockReturnValue(message) } as any;

    const consumer = new ReaderConsumer(createReader as any, updateReader as any, deleteReader as any, retryProvider as any, configService as any);

    await consumer.userCreated({ eventId: "evt-err-2", aggregateId: "user-1", aggregateVersion: 1, data: { userId: "user-1", username: "ana", email: "ana@example.com" } }, context);

    expect(retryProvider.publishRetry).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});
