import * as fs from 'node:fs';
import jwtConfig from '../config/jwt.config';

jest.mock('node:fs');

describe('jwtConfig', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('deve registrar as configurações de JWT corretamente a partir das variáveis de ambiente', () => {
    process.env.JWT_PRIVATE_KEY = '/path/to/private.key';
    process.env.JWT_PUBLIC_KEY = '/path/to/public.key';
    process.env.JWT_TOKEN_AUDIENCE = 'balloon-audience';
    process.env.JWT_TOKEN_ISSUER = 'balloon-issuer';
    process.env.JWT_TOKEN_EXPIRATION = '1800';
    process.env.JWT_REFRESH_TOKEN_EXPIRATION = '43200';

    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path === '/path/to/private.key') return 'mocked-private-key';
      if (path === '/path/to/public.key') return 'mocked-public-key';
      return '';
    });

    const config = jwtConfig();

    expect(config.privateKey).toBe('mocked-private-key');
    expect(config.publicKey).toBe('mocked-public-key');
    expect(config.signOptions.audience).toBe('balloon-audience');
    expect(config.signOptions.issuer).toBe('balloon-issuer');
    expect(config.verifyOptions.audience).toBe('balloon-audience');
    expect(config.verifyOptions.issuer).toBe('balloon-issuer');
    expect(config.expiresIn).toBe(1800);
    expect(config.refreshTokenExpiresIn).toBe(43200);
  });

  it('deve lançar erro caso JWT_PRIVATE_KEY não esteja configurada', () => {
    delete process.env.JWT_PRIVATE_KEY;
    process.env.JWT_PUBLIC_KEY = '/path/to/public.key';

    expect(() => jwtConfig()).toThrow('JWT_PRIVATE_KEY não foi configurada.');
  });

  it('deve lançar erro caso JWT_PUBLIC_KEY não esteja configurada', () => {
    process.env.JWT_PRIVATE_KEY = '/path/to/private.key';
    delete process.env.JWT_PUBLIC_KEY;
    (fs.readFileSync as jest.Mock).mockReturnValue('mocked-private-key');

    expect(() => jwtConfig()).toThrow('JWT_PUBLIC_KEY não foi configurada.');
  });
});