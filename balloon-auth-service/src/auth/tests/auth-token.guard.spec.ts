import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthTokenGuard } from '../guards/auth-token.guard';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constant';

describe('AuthTokenGuard', () => {
  let guard: AuthTokenGuard;
  let jwtService: jest.Mocked<JwtService>;

  const jwtConfiguration = {
    publicKey: 'public-key',
    verifyOptions: {
      algorithms: ['RS256' as const],
      audience: 'audience',
      issuer: 'issuer',
    },
  };

  const createExecutionContext = (request: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    guard = new AuthTokenGuard(jwtService, jwtConfiguration as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve lançar UnauthorizedException quando nenhum token for fornecido', async () => {
      const context = createExecutionContext({ headers: {} });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando o tipo do token não for access', async () => {
      jwtService.verifyAsync.mockResolvedValue({ tokenType: 'refresh' });
      const context = createExecutionContext({
        headers: { authorization: 'Bearer token-valido' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando o token for inválido', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('token inválido'));
      const context = createExecutionContext({
        headers: { authorization: 'Bearer token-invalido' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve permitir o acesso e anexar o payload à requisição quando o token for válido', async () => {
      const payload = { sub: 'user-id', tokenType: 'access' };
      jwtService.verifyAsync.mockResolvedValue(payload);
      const request: any = {
        headers: { authorization: 'Bearer token-valido' },
      };
      const context = createExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request[REQUEST_TOKEN_PAYLOAD_KEY]).toBe(payload);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('deve retornar o token quando o cabeçalho estiver no formato Bearer', () => {
      const request: any = {
        headers: { authorization: 'Bearer meu-token' },
      };

      expect(guard.extractTokenFromHeader(request)).toBe('meu-token');
    });

    it('deve retornar undefined quando o cabeçalho de autorização não existir', () => {
      const request: any = { headers: {} };

      expect(guard.extractTokenFromHeader(request)).toBeUndefined();
    });

    it('deve retornar undefined quando o cabeçalho não estiver no formato Bearer', () => {
      const request: any = {
        headers: { authorization: 'Basic meu-token' },
      };

      expect(guard.extractTokenFromHeader(request)).toBeUndefined();
    });
  });
});
