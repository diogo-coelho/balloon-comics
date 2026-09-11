import { useAuthStore } from '@/store/auth.store';
import { AuthUser } from '@/types/auth';

describe('useAuthStore', () => {
  const user: AuthUser = { id: 'user-id', email: 'usuario@teste.com' };

  afterEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAuthReady: false,
    });
  });

  it('deve iniciar com o estado padrão de usuário não autenticado', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAuthReady).toBe(false);
  });

  it('setUser deve definir o usuário e marcar como autenticado', () => {
    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('clearUser deve remover o usuário e marcar como não autenticado', () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().clearUser();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuthReady deve atualizar a flag isAuthReady', () => {
    useAuthStore.getState().setAuthReady(true);

    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });
});
