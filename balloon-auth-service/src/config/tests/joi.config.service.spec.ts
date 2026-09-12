import { getJoiConfig } from '../joi.config.service';

describe('getJoiConfig', () => {
  const validConfig = {
    JWT_PRIVATE_KEY: 'test-private-key',
    JWT_PUBLIC_KEY: 'test-public-key',
    JWT_TOKEN_AUDIENCE: 'test-audience',
    JWT_TOKEN_ISSUER: 'test-issuer',
    PG_DATABASE_HOST: 'localhost',
    PG_DATABASE_PORT: 5432,
    PG_DATABASE_NAME: 'balloon_auth_db',
    PG_DATABASE_USERNAME: 'postgres',
    PG_DATABASE_PASSWORD: 'password',
    NEXT_URL: 'http://localhost:3000',
    RABBITMQ_DEFAULT_USER: 'guest',
    RABBITMQ_DEFAULT_PASS: 'guest',
    RABBITMQ_URL: 'amqp://localhost:5672',
  };

  it('deve validar com sucesso um conjunto válido de variáveis de ambiente com defaults', () => {
    const schema = getJoiConfig();
    const { error, value } = schema.validate(validConfig);

    expect(error).toBeUndefined();
    expect(value.PORT).toBe(8081);
    expect(value.JWT_TOKEN_EXPIRATION).toBe(3600);
    expect(value.JWT_REFRESH_TOKEN_EXPIRATION).toBe(86400);
  });

  it('deve retornar erro quando variáveis obrigatórias estiverem ausentes', () => {
    const schema = getJoiConfig();
    const { error } = schema.validate({});

    expect(error).toBeDefined();
  });
});