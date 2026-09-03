import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { LoginDto } from '../dtos/request/login.dto';
import { RefreshTokenDto } from '../dtos/request/refresh-token.dto';
import { AuthDataDto } from '../dtos/response/auth-data.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

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
    it('deve delegar a chamada para o AuthService.login e retornar seu resultado', async () => {
      const loginDto: LoginDto = {
        email: 'usuario@teste.com',
        password: 'Senha@123',
      };
      const response: AuthDataDto = {
        accessToken: 'token',
        refreshToken: 'refresh',
        next: 'http://localhost:3000/home',
      };
      authService.login.mockResolvedValue(response);
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await authController.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh',
        expect.any(Object),
      );
      expect(result).toEqual({
        message: 'Acesso concedido',
        next: response.next,
      });
    });
  });

  describe('logout', () => {
    it('deve delegar a chamada para o AuthService.logout com o id do usuário autenticado', async () => {
      authService.logout.mockResolvedValue(undefined);

      await authController.logout({ sub: 'user-id' } as any);

      expect(authService.logout).toHaveBeenCalledWith('user-id');
    });
  });

  describe('refreshTokens', () => {
    it('deve delegar a chamada para o AuthService.refreshTokens e retornar seu resultado', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };
      const response: AuthDataDto = {
        accessToken: 'novo-token',
        refreshToken: 'novo-refresh',
      };
      authService.refreshTokens.mockResolvedValue(response);

      const result = await authController.refreshTokens(refreshTokenDto);

      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toBe(response);
    });
  });
});
