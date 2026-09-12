import { ConfigService } from '@nestjs/config';
import { PostgresConfigService } from '../postgres.config.service';

describe('PostgresConfigService', () => {
  let service: PostgresConfigService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        const env: Record<string, any> = {
          PG_DATABASE_HOST: 'localhost',
          PG_DATABASE_PORT: 5432,
          PG_DATABASE_USERNAME: 'postgres',
          PG_DATABASE_PASSWORD: 'secretpassword',
          PG_DATABASE_NAME: 'balloon_auth_db',
        };
        return env[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new PostgresConfigService(configService);
  });

  it('deve retornar as opções do TypeORM configuradas a partir do ConfigService', () => {
    const options = service.createTypeOrmOptions() as any;

    expect(options.type).toBe('postgres');
    expect(options.host).toBe('localhost');
    expect(options.port).toBe(5432);
    expect(options.username).toBe('postgres');
    expect(options.password).toBe('secretpassword');
    expect(options.database).toBe('balloon_auth_db');
    expect(options.entities).toBeDefined();
  });
});