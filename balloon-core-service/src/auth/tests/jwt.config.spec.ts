jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
}));

import { readFileSync } from 'node:fs';

import jwtConfig from '../config/jwt.config';
import { JwtSecretError } from '../error/jwt-secret.error';
import { JwtAudienceError } from '../error/jwt-audience.error';
import { JwtIssuerError } from '../error/jwt-issuer.error';

describe('jwtConfig', () => {
  const originalEnv = { ...process.env };
  const readFileSyncMock = readFileSync as jest.Mock;

  beforeEach(() => {
    readFileSyncMock.mockReset();
    delete process.env.JWT_PUBLIC_KEY;
    delete process.env.JWT_TOKEN_AUDIENCE;
    delete process.env.JWT_TOKEN_ISSUER;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve lançar JwtSecretError quando JWT_PUBLIC_KEY não estiver configurada', () => {
    process.env.JWT_TOKEN_AUDIENCE = 'audience';
    process.env.JWT_TOKEN_ISSUER = 'issuer';

    expect(() => jwtConfig()).toThrow(JwtSecretError);
  });

  it('deve lançar JwtAudienceError quando JWT_TOKEN_AUDIENCE não estiver configurada', () => {
    process.env.JWT_PUBLIC_KEY = '/path/to/public.key';
    process.env.JWT_TOKEN_ISSUER = 'issuer';

    expect(() => jwtConfig()).toThrow(JwtAudienceError);
  });

  it('deve lançar JwtIssuerError quando JWT_TOKEN_ISSUER não estiver configurado', () => {
    process.env.JWT_PUBLIC_KEY = '/path/to/public.key';
    process.env.JWT_TOKEN_AUDIENCE = 'audience';

    expect(() => jwtConfig()).toThrow(JwtIssuerError);
  });

  it('deve retornar a configuração do JWT quando todas as variáveis estiverem configuradas', () => {
    process.env.JWT_PUBLIC_KEY = '/path/to/public.key';
    process.env.JWT_TOKEN_AUDIENCE = 'audience';
    process.env.JWT_TOKEN_ISSUER = 'issuer';
    readFileSyncMock.mockReturnValue('conteudo-da-chave-publica');

    const config = jwtConfig();

    expect(readFileSyncMock).toHaveBeenCalledWith(
      '/path/to/public.key',
      'utf8',
    );
    expect(config.publicKey).toBe('conteudo-da-chave-publica');
    expect(config.verifyOptions).toEqual({
      algorithms: ['RS256'],
      audience: 'audience',
      issuer: 'issuer',
    });
  });
});
