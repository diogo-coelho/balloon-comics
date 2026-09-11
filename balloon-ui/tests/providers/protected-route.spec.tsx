const mockReplace = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}));

import { render, screen, waitFor } from '@testing-library/react';

import ProtectedRoute from '@/providers/protected-route';
import { useAuthStore } from '@/store/auth.store';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/reader');
  });

  afterEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isAuthReady: false });
  });

  it('não deve renderizar nada enquanto a autenticação não estiver pronta', () => {
    useAuthStore.setState({ isAuthReady: false, isAuthenticated: false });

    const { container } = render(
      <ProtectedRoute>
        <span>conteudo protegido</span>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('deve renderizar os filhos quando o usuário estiver autenticado', () => {
    useAuthStore.setState({ isAuthReady: true, isAuthenticated: true });

    render(
      <ProtectedRoute>
        <span>conteudo protegido</span>
      </ProtectedRoute>,
    );

    expect(screen.getByText('conteudo protegido')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('deve redirecionar para o login preservando a rota atual quando o usuário não estiver autenticado', async () => {
    useAuthStore.setState({ isAuthReady: true, isAuthenticated: false });

    const { container } = render(
      <ProtectedRoute>
        <span>conteudo protegido</span>
      </ProtectedRoute>,
    );

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Freader'),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
