jest.mock('@/services/reader.service', () => ({
  getCurrentReader: jest.fn(),
  updateCurrentReader: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useCurrentReader, useUpdateCurrentReader } from '@/hooks/queries/useReader';
import { getCurrentReader, updateCurrentReader } from '@/services/reader.service';
import { createQueryClientWrapper } from '../../utils/react-query-wrapper';

const mockedGetCurrentReader = getCurrentReader as jest.Mock;
const mockedUpdateCurrentReader = updateCurrentReader as jest.Mock;

describe('useCurrentReader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar os dados do leitor autenticado', async () => {
    const response = { data: { id: 'reader-id', username: 'usuario' } };
    mockedGetCurrentReader.mockResolvedValue(response);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useCurrentReader(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response);
    expect(mockedGetCurrentReader).toHaveBeenCalledTimes(1);
  });

  it('deve refletir o estado de erro quando a busca falhar', async () => {
    mockedGetCurrentReader.mockRejectedValue(new Error('Falha ao buscar leitor'));
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useCurrentReader(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateCurrentReader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar os dados do leitor autenticado', async () => {
    const response = { data: { id: 'reader-id', name: 'Novo nome' } };
    mockedUpdateCurrentReader.mockResolvedValue(response);
    const { wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useUpdateCurrentReader(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Novo nome' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUpdateCurrentReader.mock.calls[0][0]).toEqual({ name: 'Novo nome' });
  });
});
