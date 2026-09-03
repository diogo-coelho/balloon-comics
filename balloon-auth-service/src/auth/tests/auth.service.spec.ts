import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { AuthService } from '../auth.service';
import { HashingServiceProtocol } from '../hashing/hashing.service';
import { UserEntity } from '../../user/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { LoginDto } from '../dtos/request/login.dto';
import { RefreshTokenDto } from '../dtos/request/refresh-token.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let hashingService: jest.Mocked<HashingServiceProtocol>;
  let jwtService: jest.Mocked<JwtService>;

  const jwtConfiguration = {
    privateKey: 'private-key',
    publicKey: 'public-key',
    signOptions: {
      algorithm: 'RS256' as const,
      audience: 'audience',
      issuer: 'issuer',
    },
    verifyOptions: {
      algorithms: ['RS256' as const],
      audience: 'audience',
      issuer: 'issuer',
    },
    expiresIn: 3600,
    refreshTokenExpiresIn: 86400,
  };

  const user: UserEntity = {
    id: 'user-id',
    username: 'usuario',
    email: 'usuario@teste.com',
    passwordHash: 'hash-da-senha',
    refreshTokenHash: 'hash-do-refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    process.env.NEXT_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfiguration,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    hashingService = module.get(HashingServiceProtocol);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'usuario@teste.com',
      password: 'Senha@123',
    };

    it('deve retornar os tokens de acesso quando as credenciais forem válidas', async () => {
      userRepository.findOne.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token-gerado');
      hashingService.hash.mockResolvedValue('novo-hash-refresh');
      userRepository.update.mockResolvedValue({} as any);

      const result = await authService.login(loginDto);

      expect(result.accessToken).toBe('token-gerado');
      expect(result.refreshToken).toBe('token-gerado');
      expect(result.next).toBe('http://localhost:3000/home');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('deve lançar UnauthorizedException quando o usuário não existir', async () => {
      userRepository.findOne.mockResolvedValue(null);
      hashingService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando a senha for inválida', async () => {
      userRepository.findOne.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deve limpar o hash do refresh token do usuário', async () => {
      userRepository.update.mockResolvedValue({} as any);

      await authService.logout(user.id);

      expect(userRepository.update).toHaveBeenCalledWith(user.id, {
        refreshTokenHash: null,
      });
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refresh-token-valido',
    };

    it('deve renovar os tokens quando o refresh token for válido', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        tokenType: 'refresh',
      });
      userRepository.findOneBy.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token-renovado');
      hashingService.hash.mockResolvedValue('novo-hash-refresh');
      userRepository.update.mockResolvedValue({} as any);

      const result = await authService.refreshTokens(refreshTokenDto);

      expect(result.accessToken).toBe('token-renovado');
    });

    it('deve lançar UnauthorizedException quando o tipo do token não for refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        tokenType: 'access',
      });

      await expect(
        authService.refreshTokens(refreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o usuário não possuir refresh token salvo', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        tokenType: 'refresh',
      });
      userRepository.findOneBy.mockResolvedValue({
        ...user,
        refreshTokenHash: null,
      });

      await expect(
        authService.refreshTokens(refreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve revogar o refresh token e lançar UnauthorizedException em caso de reuso', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        tokenType: 'refresh',
      });
      userRepository.findOneBy.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(false);
      userRepository.update.mockResolvedValue({} as any);

      await expect(
        authService.refreshTokens(refreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(userRepository.update).toHaveBeenCalledWith(user.id, {
        refreshTokenHash: null,
      });
    });

    it('deve lançar UnauthorizedException quando o token for inválido ou expirado', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('token expirado'));

      await expect(
        authService.refreshTokens(refreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
