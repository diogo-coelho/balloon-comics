import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { TokenPayloadDto } from '../../auth/dtos/request/token-payload.dto';

import { CreateUserDto } from '../dtos/request/create-user.dto';
import { UpdateUserDto } from '../dtos/request/update-user.dto';
import { ResponseUserDto } from '../dtos/response/response-user.dto';
import { ResponseUpdatedUserDto } from '../dtos/response/response-updated-user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  const tokenPayload: TokenPayloadDto = {
    sub: 'user-id',
    email: 'usuario@teste.com',
    iat: 0,
    exp: 0,
    aud: 'audience',
    iss: 'issuer',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    userController = module.get(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve delegar a chamada para o UserService.createUser e retornar seu resultado', async () => {
      const createUserDto: CreateUserDto = {
        username: 'usuario',
        email: 'usuario@teste.com',
        password: 'Senha@123',
      };
      const response: ResponseUserDto = {
        message: 'Usuário criado com sucesso',
        data: {
          user: {
            id: 'user-id',
            username: 'usuario',
            email: 'usuario@teste.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        next: 'http://localhost:3000/reader/create',
      };
      userService.createUser.mockResolvedValue(response);
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await userController.createUser(
        createUserDto,
        mockResponse,
      );

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.any(Object),
      );
      expect(result).toBe(response);
      expect(result.accessToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });
  });

  describe('updateUser', () => {
    it('deve delegar a chamada para o UserService.updateUser com o id e o payload do token', async () => {
      const updateUserDto: UpdateUserDto = { username: 'novo-usuario' };
      const response: ResponseUpdatedUserDto = {
        message: 'Usuário atualizado com sucesso',
        data: {
          id: 'user-id',
          username: 'novo-usuario',
          email: 'usuario@teste.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      userService.updateUser.mockResolvedValue(response);

      const result = await userController.updateUser(
        updateUserDto,
        'user-id',
        tokenPayload,
      );

      expect(userService.updateUser).toHaveBeenCalledWith(
        'user-id',
        updateUserDto,
        tokenPayload,
      );
      expect(result).toBe(response);
    });
  });

  describe('deleteUser', () => {
    it('deve delegar a chamada para o UserService.deleteUser com o id e o payload do token', async () => {
      userService.deleteUser.mockResolvedValue(undefined);

      await userController.deleteUser('user-id', tokenPayload);

      expect(userService.deleteUser).toHaveBeenCalledWith(
        'user-id',
        tokenPayload,
      );
    });
  });
});
