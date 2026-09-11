jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('jose', () => ({
  importSPKI: jest.fn(),
  jwtVerify: jest.fn(),
}));

import { readFile } from 'node:fs/promises';
import { importSPKI, jwtVerify } from 'jose';

import { verifyToken } from '@/auth/auth';

const mockedReadFile = readFile as jest.Mock;
const mockedImportSPKI = importSPKI as jest.Mock;
const mockedJwtVerify = jwtVerify as jest.Mock;

describe('verifyToken', () => {
  const originalEnv = process.env.JWT_PUBLIC_KEY;

  afterAll(() => {
    process.env.JWT_PUBLIC_KEY = originalEnv;
  });

  it('deve lançar erro quando JWT_PUBLIC_KEY não estiver configurada', async () => {
    delete process.env.JWT_PUBLIC_KEY;

    await expect(verifyToken('qualquer-token')).rejects.toThrow(
      'JWT_PUBLIC_KEY não foi configurada.',
    );
    expect(mockedReadFile).not.toHaveBeenCalled();
  });

  it('deve verificar o token usando a chave pública configurada', async () => {
    process.env.JWT_PUBLIC_KEY = 'keys/public.pem';
    mockedReadFile.mockResolvedValue('conteudo-da-chave-publica');
    mockedImportSPKI.mockResolvedValue('chave-publica-importada');
    mockedJwtVerify.mockResolvedValue({ payload: { sub: 'user-id' } });

    const result = await verifyToken('token-valido');

    expect(mockedReadFile).toHaveBeenCalledWith(
      expect.stringContaining('public.pem'),
      'utf8',
    );
    expect(mockedImportSPKI).toHaveBeenCalledWith(
      'conteudo-da-chave-publica',
      'RS256',
    );
    expect(mockedJwtVerify).toHaveBeenCalledWith(
      'token-valido',
      'chave-publica-importada',
      { algorithms: ['RS256'] },
    );
    expect(result).toEqual({ payload: { sub: 'user-id' } });
  });

  it('deve reutilizar a chave pública já carregada em chamadas subsequentes', async () => {
    mockedJwtVerify.mockResolvedValue({ payload: { sub: 'outro-usuario' } });

    await verifyToken('outro-token');

    expect(mockedReadFile).toHaveBeenCalledTimes(1);
  });

  it('deve lançar "Token inválido" quando a verificação do token falhar', async () => {
    mockedJwtVerify.mockRejectedValue(new Error('assinatura inválida'));

    await expect(verifyToken('token-invalido')).rejects.toThrow('Token inválido');
  });
});
