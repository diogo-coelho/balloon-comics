jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

import { api } from '@/lib/api';
import { getCurrentReader, updateCurrentReader } from '@/services/reader.service';

const mockedApi = api as jest.Mocked<typeof api>;

describe('reader.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentReader', () => {
    it('deve retornar os dados do leitor autenticado', async () => {
      const responseData = { data: { id: 'reader-id', username: 'usuario' } };
      mockedApi.get.mockResolvedValue({ data: responseData });

      const result = await getCurrentReader();

      expect(mockedApi.get).toHaveBeenCalledWith('/readers/me');
      expect(result).toEqual(responseData);
    });

    it('deve propagar o erro quando a chamada falhar', async () => {
      const error = new Error('Falha ao buscar leitor');
      mockedApi.get.mockRejectedValue(error);

      await expect(getCurrentReader()).rejects.toThrow(error);
    });
  });

  describe('updateCurrentReader', () => {
    it('deve atualizar os dados do leitor autenticado', async () => {
      const payload = { name: 'Novo nome' };
      const responseData = { data: { id: 'reader-id', name: 'Novo nome' } };
      mockedApi.patch.mockResolvedValue({ data: responseData });

      const result = await updateCurrentReader(payload);

      expect(mockedApi.patch).toHaveBeenCalledWith('/readers/me', payload);
      expect(result).toEqual(responseData);
    });

    it('deve propagar o erro quando a chamada falhar', async () => {
      const error = new Error('Falha ao atualizar leitor');
      mockedApi.patch.mockRejectedValue(error);

      await expect(updateCurrentReader({ name: 'x' })).rejects.toThrow(error);
    });
  });
});
