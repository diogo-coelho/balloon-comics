import { RabbitMqRetryProvider } from '../messaging/rabbit-mq/rabbitmq-retry.provider';

describe('RabbitMqRetryProvider', () => {
  it('deve publicar mensagem de retry no exchange com headers incrementados', async () => {
    const publish = jest.fn().mockResolvedValue(undefined);
    const provider = new RabbitMqRetryProvider({
      getOrThrow: jest.fn().mockReturnValue('balloon.retry'),
    } as any);

    (provider as any).channel = { publish };
    (provider as any).connection = { close: jest.fn() };
    (provider as any).unroutedCorrelationIds = new Set();

    const message = {
      fields: { routingKey: 'reader.created' },
      content: Buffer.from('payload'),
      properties: {
        messageId: 'msg-1',
        type: 'user.created',
        contentType: 'application/json',
        headers: { 'x-retry-count': 0 },
      },
    } as any;

    await provider.publishRetry(message, 1);

    expect(publish).toHaveBeenCalledWith(
      'balloon.retry',
      'reader.created',
      Buffer.from('payload'),
      expect.objectContaining({
        persistent: true,
        mandatory: true,
        headers: expect.objectContaining({ 'x-retry-count': 1 }),
      }),
    );
  });

  it('deve lançar erro quando a mensagem retry não encontrou rota válida', async () => {
    const publish = jest.fn().mockResolvedValue(undefined);
    const provider = new RabbitMqRetryProvider({
      getOrThrow: jest.fn().mockReturnValue('balloon.retry'),
    } as any);

    (provider as any).channel = { publish };
    (provider as any).unroutedCorrelationIds = new Set(['should-fail']);

    const message = {
      fields: { routingKey: 'reader.created' },
      content: Buffer.from('payload'),
      properties: {
        messageId: 'msg-2',
        type: 'user.created',
        contentType: 'application/json',
        headers: { 'x-retry-count': 1 },
      },
    } as any;

    const originalUUID = jest.requireActual('crypto').randomUUID;
    jest.spyOn(require('crypto'), 'randomUUID').mockReturnValue('should-fail');

    await expect(provider.publishRetry(message, 2)).rejects.toThrow(
      'Mensagem de retry sem rota válida',
    );

    jest.spyOn(require('crypto'), 'randomUUID').mockRestore();
  });
});
