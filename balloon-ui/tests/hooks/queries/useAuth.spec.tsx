jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useLogin } from '@/hooks/queries/useAuth';
import { login } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { createQueryClientWrapper } from '../../utils/react-query-wrapper';

const mockedLogin = login as jest.Mock;

describe('useLogin', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isAuthReady: false });
  });

  it('deve autenticar o usuário e atualizar o auth store em caso de sucesso', async () => {
    const response = {
      message: 'Acesso concedido',
      data: { id: 'user-id', email: 'usuario@teste.com' },
    };
    mockedLogin.mockResolvedValue(response);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: 'usuario@teste.com', password: 'Senha@123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toEqual(response.data);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('deve propagar o erro e não atualizar o auth store em caso de falha', async () => {
    const error = new Error('Credenciais inválidas');
    mockedLogin.mockRejectedValue(error);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ email: 'usuario@teste.com', password: 'errada' }),
      ).rejects.toThrow(error);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
