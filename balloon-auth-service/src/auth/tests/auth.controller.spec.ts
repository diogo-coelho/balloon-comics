import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { LoginDto } from '../dtos/request/login.dto';
import { AuthDataDto } from '../dtos/response/auth-data.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const buildMockResponse = (): jest.Mocked<Response> =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as jest.Mocked<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'usuario@teste.com',
      password: 'Senha@123',
    };
    const response: AuthDataDto = {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'user-id', email: 'usuario@teste.com' },
      next: 'http://localhost:3000/home',
    };

    it('deve delegar a chamada para o AuthService.login e retornar seu resultado', async () => {
      authService.login.mockResolvedValue(response);
      const mockResponse = buildMockResponse();

      const result = await authController.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        message: 'Acesso concedido',
        data: {
          id: response.user?.id,
          email: response.user?.email,
        },
        next: response.next,
      });
    });

    it('deve definir os cookies accessToken e refreshToken com as opções corretas', async () => {
      authService.login.mockResolvedValue(response);
      const mockResponse = buildMockResponse();

      await authController.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        response.accessToken,
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        response.refreshToken,
        expect.objectContaining({ httpOnly: true, path: '/api/auth/refresh' }),
      );
    });
  });

  describe('logout', () => {
    it('deve delegar a chamada para o AuthService.logout com o id do usuário autenticado', async () => {
      authService.logout.mockResolvedValue(undefined);
      const mockResponse = buildMockResponse();

      await authController.logout({ sub: 'user-id' } as any, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('user-id');
    });

    it('deve limpar os cookies accessToken e refreshToken', async () => {
      authService.logout.mockResolvedValue(undefined);
      const mockResponse = buildMockResponse();

      await authController.logout({ sub: 'user-id' } as any, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({ path: '/' }),
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({ path: '/auth/refresh' }),
      );
    });
  });

  describe('refreshTokens', () => {
    const buildMockRequest = (refreshToken?: string): Request =>
      ({ cookies: { refreshToken } }) as unknown as Request;

    it('deve delegar a chamada para o AuthService.refreshTokens usando o refreshToken do cookie', async () => {
      const response: AuthDataDto = {
        accessToken: 'novo-token',
        refreshToken: 'novo-refresh',
      };
      authService.refreshTokens.mockResolvedValue(response);
      const mockResponse = buildMockResponse();

      const result = await authController.refreshTokens(
        buildMockRequest('refresh-token'),
        mockResponse,
      );

      expect(authService.refreshTokens).toHaveBeenCalledWith({
        refreshToken: 'refresh-token',
      });
      expect(result).toEqual({ message: 'Tokens atualizados' });
    });

    it('deve definir os novos cookies accessToken e refreshToken', async () => {
      const response: AuthDataDto = {
        accessToken: 'novo-token',
        refreshToken: 'novo-refresh',
      };
      authService.refreshTokens.mockResolvedValue(response);
      const mockResponse = buildMockResponse();

      await authController.refreshTokens(
        buildMockRequest('refresh-token'),
        mockResponse,
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        response.accessToken,
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        response.refreshToken,
        expect.any(Object),
      );
    });

    it('deve lançar UnauthorizedException quando o cookie refreshToken não for enviado', async () => {
      const mockResponse = buildMockResponse();

      await expect(
        authController.refreshTokens(buildMockRequest(undefined), mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.refreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('deve retornar o id e o email extraídos do token payload', async () => {
      const result = await authController.getProfile({
        sub: 'user-id',
        email: 'usuario@teste.com',
      } as any);

      expect(result).toEqual({ id: 'user-id', email: 'usuario@teste.com' });
    });
  });
});
