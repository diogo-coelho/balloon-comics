jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { api } from '@/lib/api';
import { login, logout, getProfile } from '@/services/auth.service';

const mockedApi = api as jest.Mocked<typeof api>;

describe('auth.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve chamar a API de login e retornar os dados da resposta', async () => {
      const responseData = { message: 'Acesso concedido', data: { id: 'user-id', email: 'usuario@teste.com' } };
      mockedApi.post.mockResolvedValue({ data: responseData });

      const result = await login({ email: 'usuario@teste.com', password: 'Senha@123' });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'usuario@teste.com',
        password: 'Senha@123',
      });
      expect(result).toEqual(responseData);
    });

    it('deve propagar o erro quando a chamada falhar', async () => {
      const error = new Error('Credenciais inválidas');
      mockedApi.post.mockRejectedValue(error);

      await expect(
        login({ email: 'usuario@teste.com', password: 'errada' }),
      ).rejects.toThrow(error);
    });
  });

  describe('logout', () => {
    it('deve chamar a API de logout', async () => {
      mockedApi.post.mockResolvedValue({ data: undefined });

      await logout();

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('deve propagar o erro quando a chamada falhar', async () => {
      const error = new Error('Falha ao sair');
      mockedApi.post.mockRejectedValue(error);

      await expect(logout()).rejects.toThrow(error);
    });
  });

  describe('getProfile', () => {
    it('deve retornar os dados do perfil do usuário autenticado', async () => {
      const responseData = { data: { id: 'user-id', email: 'usuario@teste.com' } };
      mockedApi.get.mockResolvedValue({ data: responseData });

      const result = await getProfile();

      expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(responseData);
    });
  });
});
