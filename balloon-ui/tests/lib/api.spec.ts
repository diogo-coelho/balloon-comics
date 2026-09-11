jest.mock('axios', () => {
  const mockApiInstance: any = jest.fn();
  mockApiInstance.interceptors = { response: { use: jest.fn() } };
  mockApiInstance.post = jest.fn();
  mockApiInstance.get = jest.fn();

  const mockRefreshInstance: any = jest.fn();
  mockRefreshInstance.interceptors = { response: { use: jest.fn() } };
  mockRefreshInstance.post = jest.fn();

  return {
    __esModule: true,
    default: {
      create: jest
        .fn()
        .mockImplementationOnce(() => mockApiInstance)
        .mockImplementationOnce(() => mockRefreshInstance),
    },
    mockApiInstance,
    mockRefreshInstance,
  };
});

import * as axiosMock from 'axios';
// Import for its side effect of registering the response interceptor under test.
import '@/lib/api';

const apiInstance = (axiosMock as unknown as { mockApiInstance: any }).mockApiInstance;
const refreshInstance = (axiosMock as unknown as { mockRefreshInstance: any })
  .mockRefreshInstance;

type ResponseErrorHandler = (error: any) => Promise<any>;

const responseErrorHandler: ResponseErrorHandler =
  apiInstance.interceptors.response.use.mock.calls[0][1];

describe('api response interceptor', () => {
  afterEach(() => {
    apiInstance.mockClear();
    apiInstance.post.mockClear();
    apiInstance.get.mockClear();
    refreshInstance.post.mockClear();
  });

  it('deve rejeitar erros diferentes de 401 definindo a mensagem a partir de apiData.message', async () => {
    const error: any = {
      response: { status: 500, data: { message: 'Erro interno' } },
      config: { url: '/reader/create', _retry: false },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(error.message).toBe('Erro interno');
    expect(refreshInstance.post).not.toHaveBeenCalled();
  });

  it('deve rejeitar erros de rede sem response mantendo o erro original', async () => {
    const error: any = { message: 'Network Error', config: { url: '/reader/create', _retry: false } };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(error.message).toBe('Network Error');
    expect(refreshInstance.post).not.toHaveBeenCalled();
  });

  it('deve concatenar mensagens quando apiData.message for uma lista', async () => {
    const error: any = {
      response: { status: 400, data: { message: ['Campo obrigatório', 'Formato inválido'] } },
      config: { url: '/users/me', _retry: false },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(error.message).toBe('Campo obrigatório, Formato inválido');
  });

  it('deve usar apiData.error quando apiData.message não estiver presente', async () => {
    const error: any = {
      response: { status: 403, data: { error: 'Acesso negado' } },
      config: { url: '/users/me', _retry: false },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(error.message).toBe('Acesso negado');
  });

  it('deve renovar o token e repetir a requisição original quando receber 401', async () => {
    refreshInstance.post.mockResolvedValue({ data: {} });
    apiInstance.mockResolvedValue('resposta-repetida');

    const originalRequest: any = { url: '/reader/create', _retry: false };
    const error: any = { response: { status: 401 }, config: originalRequest };

    const result = await responseErrorHandler(error);

    expect(refreshInstance.post).toHaveBeenCalledWith('/auth/refresh');
    expect(originalRequest._retry).toBe(true);
    expect(apiInstance).toHaveBeenCalledWith(originalRequest);
    expect(result).toBe('resposta-repetida');
  });

  it('não deve tentar renovar o token quando a requisição já for um retry', async () => {
    const error: any = {
      response: { status: 401, data: { message: 'Não autorizado' } },
      config: { url: '/reader/create', _retry: true },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(refreshInstance.post).not.toHaveBeenCalled();
  });

  it('não deve tentar renovar o token quando a requisição for para /auth/refresh', async () => {
    const error: any = {
      response: { status: 401, data: { message: 'Refresh token inválido' } },
      config: { url: '/auth/refresh', _retry: false },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(refreshInstance.post).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando a renovação do token falhar', async () => {
    const refreshError = new Error('Falha ao renovar token');
    refreshInstance.post.mockRejectedValue(refreshError);

    const error: any = {
      response: { status: 401 },
      config: { url: '/reader/create', _retry: false },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(refreshError);
    expect(apiInstance).not.toHaveBeenCalled();
  });

  it('deve compartilhar a mesma renovação de token entre requisições 401 concorrentes', async () => {
    let resolveRefresh: (value?: unknown) => void = () => {};
    refreshInstance.post.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    apiInstance.mockResolvedValue('ok');

    const error1: any = {
      response: { status: 401 },
      config: { url: '/reader/create', _retry: false },
    };
    const error2: any = {
      response: { status: 401 },
      config: { url: '/users/me', _retry: false },
    };

    const promise1 = responseErrorHandler(error1);
    const promise2 = responseErrorHandler(error2);

    resolveRefresh();
    await Promise.all([promise1, promise2]);

    expect(refreshInstance.post).toHaveBeenCalledTimes(1);
    expect(apiInstance).toHaveBeenCalledTimes(2);
  });
});
