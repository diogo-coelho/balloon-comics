import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserService } from '../user.service';
import { UserEntity } from '../entities/user.entity';
import { OutboxEventEntity } from '../entities/outbox-event.entity';

import { HashingServiceProtocol } from '../../auth/hashing/hashing.service';
import { AuthService } from '../../auth/auth.service';
import { TokenPayloadDto } from '../../auth/dtos/request/token-payload.dto';

import { CreateUserDto } from '../dtos/request/create-user.dto';
import { UpdateUserDto } from '../dtos/request/update-user.dto';

import { AUTH_ROUTING_KEYS } from '../../constants/routing-keys';

describe('UserService', () => {
  let userService: UserService;
  let dataSource: jest.Mocked<DataSource>;
  let hashingService: jest.Mocked<HashingServiceProtocol>;
  let authService: jest.Mocked<AuthService>;

  let manager: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
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

  const tokenPayload: TokenPayloadDto = {
    sub: user.id,
    email: user.email,
    iat: 0,
    exp: 0,
    aud: 'audience',
    iss: 'issuer',
  };

  beforeEach(async () => {
    manager = {
      create: jest.fn((EntityClass: any, data: any) =>
        EntityClass === UserEntity ? { ...user, ...data } : { ...data },
      ),
      save: jest.fn(async (_EntityClass: any, entity: any) => entity),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((callback: any) => callback(manager)),
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
          provide: AuthService,
          useValue: {
            getNextUrl: jest.fn(),
            generateTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get(UserService);
    dataSource = module.get(DataSource);
    hashingService = module.get(HashingServiceProtocol);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      username: 'usuario',
      email: 'usuario@teste.com',
      password: 'Senha@123',
    };

    it('deve criar um usuário com sucesso e retornar os dados esperados', async () => {
      hashingService.hash.mockResolvedValue('hash-da-senha');
      authService.getNextUrl.mockResolvedValue(
        'http://localhost:3000/reader/create',
      );
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await userService.createUser(createUserDto);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(result.message).toBe('Usuário criado com sucesso');
      expect(result.data?.user.username).toBe(createUserDto.username);
      expect(result.data?.user.email).toBe(createUserDto.email);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.next).toBe('http://localhost:3000/reader/create');
    });

    it('deve persistir um evento outbox do tipo USER_CREATED', async () => {
      hashingService.hash.mockResolvedValue('hash-da-senha');
      authService.getNextUrl.mockResolvedValue('http://localhost:3000/reader/create');
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await userService.createUser(createUserDto);

      expect(manager.create).toHaveBeenCalledWith(
        OutboxEventEntity,
        expect.objectContaining({
          eventType: AUTH_ROUTING_KEYS.USER_CREATED,
          status: 'pending',
        }),
      );
      expect(manager.save).toHaveBeenCalledWith(
        OutboxEventEntity,
        expect.anything(),
      );
    });

    it('deve utilizar a transação do DataSource para criar o usuário', async () => {
      hashingService.hash.mockResolvedValue('hash-da-senha');
      authService.getNextUrl.mockResolvedValue('http://localhost:3000/reader/create');
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await userService.createUser(createUserDto);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'novo-usuario',
    };

    it('deve atualizar o usuário quando o solicitante for o próprio dono do recurso', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      const result = await userService.updateUser(
        user.id,
        updateUserDto,
        tokenPayload,
      );

      expect(result.message).toBe('Usuário atualizado com sucesso');
      expect(result.data?.username).toBe(updateUserDto.username);
    });

    it('deve gerar um novo hash de senha quando a senha for informada', async () => {
      manager.findOne.mockResolvedValue({ ...user });
      hashingService.hash.mockResolvedValue('novo-hash-de-senha');

      await userService.updateUser(
        user.id,
        { password: 'NovaSenha@123' },
        tokenPayload,
      );

      expect(hashingService.hash).toHaveBeenCalledWith('NovaSenha@123');
    });

    it('deve persistir um evento outbox USER_UPDATED quando username ou email forem alterados', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await userService.updateUser(user.id, updateUserDto, tokenPayload);

      expect(manager.create).toHaveBeenCalledWith(
        OutboxEventEntity,
        expect.objectContaining({
          eventType: AUTH_ROUTING_KEYS.USER_UPDATED,
          status: 'pending',
        }),
      );
    });

    it('não deve persistir evento outbox quando username e email não forem alterados', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await userService.updateUser(
        user.id,
        { password: 'NovaSenha@123' },
        tokenPayload,
      );

      expect(manager.create).not.toHaveBeenCalledWith(
        OutboxEventEntity,
        expect.anything(),
      );
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        userService.updateUser(user.id, updateUserDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando o solicitante não for o dono do recurso', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await expect(
        userService.updateUser(user.id, updateUserDto, {
          ...tokenPayload,
          sub: 'outro-usuario-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUser', () => {
    it('deve remover o usuário quando o solicitante for o próprio dono do recurso', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await userService.deleteUser(user.id, tokenPayload);

      expect(manager.remove).toHaveBeenCalledWith(
        UserEntity,
        expect.objectContaining({ id: user.id }),
      );
    });

    it('deve persistir um evento outbox do tipo USER_DELETED', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await userService.deleteUser(user.id, tokenPayload);

      expect(manager.create).toHaveBeenCalledWith(
        OutboxEventEntity,
        expect.objectContaining({
          eventType: AUTH_ROUTING_KEYS.USER_DELETED,
          userId: user.id,
          status: 'pending',
        }),
      );
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        userService.deleteUser(user.id, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando o solicitante não for o dono do recurso', async () => {
      manager.findOne.mockResolvedValue({ ...user });

      await expect(
        userService.deleteUser(user.id, {
          ...tokenPayload,
          sub: 'outro-usuario-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
