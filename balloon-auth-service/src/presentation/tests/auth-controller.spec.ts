import { AuthController } from '../http/auth/auth.controller';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.use-case';
import HttpCookies from '../http/cookies/http-cookies';
import { User } from '../../domain/user/entities/user';

describe('Integração do fluxo HTTP de autenticação', () => {
  it('deve fazer login usando o caso de uso e configurar cookies', async () => {
    const user = User.create({
      username: 'ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
    });
    const users = {
      findByEmail: jest.fn().mockResolvedValue(user),
      save: jest.fn(),
    };
    const controller = new AuthController(
      new LoginUseCase(
        users,
        {
          compare: jest.fn().mockResolvedValue(true),
          hash: jest.fn().mockResolvedValue('refresh-hash'),
        },
        {
          generateAccessToken: jest.fn().mockResolvedValue('access'),
          generateRefreshToken: jest.fn().mockResolvedValue('refresh'),
        },
      ),
      new LogoutUseCase(users),
      {} as RefreshTokenUseCase,
      new HttpCookies(),
    );
    const response = { cookie: jest.fn() };

    await expect(
      controller.login(
        { email: user.email, password: 'senha' },
        response as never,
      ),
    ).resolves.toEqual({
      message: 'Acesso concedido',
      data: { id: user.id, email: user.email },
    });
    expect(response.cookie).toHaveBeenCalledTimes(2);
  });

  it('deve bloquear refresh sem cookie e retornar o perfil autenticado', async () => {
    const controller = new AuthController(
      {} as LoginUseCase,
      {} as LogoutUseCase,
      {} as RefreshTokenUseCase,
      new HttpCookies(),
    );
    const response = { cookie: jest.fn() };

    await expect(
      controller.refreshToken({ cookies: {} } as never, response as never),
    ).rejects.toThrow('Refresh token não fornecido');
    expect(
      controller.getProfile({ sub: 'id', email: 'ana@example.com' }),
    ).toEqual({ id: 'id', email: 'ana@example.com' });
  });
});
