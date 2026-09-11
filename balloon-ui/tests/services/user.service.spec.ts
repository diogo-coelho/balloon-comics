jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

import { api } from '@/lib/api';
import { createUser } from '@/services/user.service';

const mockedApi = api as jest.Mocked<typeof api>;

describe('user.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve criar um usuário e retornar os dados da resposta', async () => {
      const payload = { username: 'usuario', email: 'usuario@teste.com', password: 'Senha@123' };
      const responseData = { message: 'Usuário criado com sucesso', data: { id: 'user-id', username: 'usuario' } };
      mockedApi.post.mockResolvedValue({ data: responseData });

      const result = await createUser(payload);

      expect(mockedApi.post).toHaveBeenCalledWith('/users/me', payload);
      expect(result).toEqual(responseData);
    });

    it('deve propagar o erro quando a chamada falhar', async () => {
      const error = new Error('E-mail já está em uso');
      mockedApi.post.mockRejectedValue(error);

      await expect(
        createUser({ username: 'usuario', email: 'usuario@teste.com', password: 'Senha@123' }),
      ).rejects.toThrow(error);
    });
  });
});
