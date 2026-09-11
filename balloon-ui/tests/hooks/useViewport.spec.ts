import { renderHook, act } from '@testing-library/react';
import useViewport from '@/hooks/useViewport';

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useViewport', () => {
  afterEach(() => {
    setWindowWidth(1024);
  });

  it('deve definir screenWidth com a largura atual da janela ao montar', () => {
    setWindowWidth(1440);

    const { result } = renderHook(() => useViewport());

    expect(result.current.screenWidth).toBe(1440);
  });

  it('deve identificar a visualização mobile quando a largura for menor que 720', () => {
    setWindowWidth(500);

    const { result } = renderHook(() => useViewport());

    expect(result.current.getViewPort()).toBe('mobile-view');
    expect(result.current.isMobileView()).toBe(true);
  });

  it('deve identificar a visualização tablet quando a largura estiver entre 720 e 1080', () => {
    setWindowWidth(800);

    const { result } = renderHook(() => useViewport());

    expect(result.current.getViewPort()).toBe('tablet-view');
    expect(result.current.isMobileView()).toBe(false);
  });

  it('deve identificar a visualização desktop quando a largura for maior ou igual a 1080', () => {
    setWindowWidth(1280);

    const { result } = renderHook(() => useViewport());

    expect(result.current.getViewPort()).toBe('desktop-view');
    expect(result.current.isMobileView()).toBe(false);
  });

  it('deve atualizar a largura quando a janela for redimensionada', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useViewport());

    act(() => {
      setWindowWidth(400);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.screenWidth).toBe(400);
    expect(result.current.getViewPort()).toBe('mobile-view');
  });

  it('deve remover o listener de resize ao desmontar', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useViewport());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
