jest.mock('@/services/auth.service', () => ({
  getProfile: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';

import { AuthInitializer } from '@/providers/auth-provider';
import { getProfile } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const mockedGetProfile = getProfile as jest.Mock;

describe('AuthInitializer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isAuthReady: false });
  });

  it('deve definir o usuário e marcar a autenticação como pronta quando o perfil for recuperado com sucesso', async () => {
    const user = { id: 'user-id', email: 'usuario@teste.com' };
    mockedGetProfile.mockResolvedValue({ data: user });

    render(
      <AuthInitializer>
        <span>conteudo protegido</span>
      </AuthInitializer>,
    );

    await waitFor(() => expect(useAuthStore.getState().isAuthReady).toBe(true));
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(screen.getByText('conteudo protegido')).toBeInTheDocument();
  });

  it('deve limpar o usuário e marcar a autenticação como pronta quando a busca do perfil falhar', async () => {
    mockedGetProfile.mockRejectedValue(new Error('Não autenticado'));

    render(
      <AuthInitializer>
        <span>conteudo protegido</span>
      </AuthInitializer>,
    );

    await waitFor(() => expect(useAuthStore.getState().isAuthReady).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('deve sempre renderizar os filhos, independentemente do estado de autenticação', () => {
    mockedGetProfile.mockResolvedValue({ data: null });

    render(
      <AuthInitializer>
        <span>conteudo sempre visivel</span>
      </AuthInitializer>,
    );

    expect(screen.getByText('conteudo sempre visivel')).toBeInTheDocument();
  });
});
