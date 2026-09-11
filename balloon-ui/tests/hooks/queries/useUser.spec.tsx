jest.mock('@/services/user.service', () => ({
  createUser: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useCreatedUser } from '@/hooks/queries/useUser';
import { createUser } from '@/services/user.service';
import { createQueryClientWrapper } from '../../utils/react-query-wrapper';

const mockedCreateUser = createUser as jest.Mock;

describe('useCreatedUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar o usuário com sucesso', async () => {
    const response = { message: 'Usuário criado com sucesso', data: { id: 'user-id' } };
    mockedCreateUser.mockResolvedValue(response);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useCreatedUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        username: 'usuario',
        email: 'usuario@teste.com',
        password: 'Senha@123',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedCreateUser.mock.calls[0][0]).toEqual({
      username: 'usuario',
      email: 'usuario@teste.com',
      password: 'Senha@123',
    });
  });

  it('deve propagar o erro quando a criação falhar', async () => {
    const error = new Error('Email informado já está em uso');
    mockedCreateUser.mockRejectedValue(error);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useCreatedUser(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          username: 'usuario',
          email: 'usuario@teste.com',
          password: 'Senha@123',
        }),
      ).rejects.toThrow(error);
    });
  });
});
