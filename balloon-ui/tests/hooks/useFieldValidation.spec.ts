import { renderHook, act } from '@testing-library/react';
import useFieldValidation from '@/hooks/useFieldValidation';

describe('useFieldValidation', () => {
  describe('validateRequiredFields', () => {
    it('deve retornar false e definir erros quando os campos obrigatórios estiverem vazios', () => {
      const { result } = renderHook(() =>
        useFieldValidation(['userName', 'email', 'password', 'confirmPassword']),
      );

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorUserName).toBeDefined();
      expect(result.current.errorEmail).toBeDefined();
      expect(result.current.errorPassword).toBeDefined();
    });

    it('deve retornar true quando todos os campos forem válidos', () => {
      const { result } = renderHook(() =>
        useFieldValidation(['userName', 'email', 'password', 'confirmPassword']),
      );

      act(() => {
        result.current.getUserNameValue('usuario_123');
        result.current.getEmailValue('usuario@teste.com');
        result.current.getPasswordValue('Senha@123');
        result.current.getConfirmPasswordValue('Senha@123');
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(true);
      expect(result.current.errorUserName).toBeUndefined();
      expect(result.current.errorEmail).toBeUndefined();
      expect(result.current.errorPassword).toBeUndefined();
      expect(result.current.errorConfirmPassword).toBeUndefined();
    });

    it('deve reportar erro de formato quando o nome de usuário for inválido', () => {
      const { result } = renderHook(() => useFieldValidation(['userName']));

      act(() => {
        result.current.getUserNameValue('a@');
      });

      act(() => {
        result.current.validateRequiredFields();
      });

      expect(result.current.errorUserName).toContain('3 e 20 caracteres');
    });

    it('deve reportar erro de formato quando o e-mail for inválido', () => {
      const { result } = renderHook(() => useFieldValidation(['email']));

      act(() => {
        result.current.getEmailValue('email-invalido');
      });

      act(() => {
        result.current.validateRequiredFields();
      });

      expect(result.current.errorEmail).toBe('E-mail está em formato incorreto');
    });

    it('deve reportar erro quando a senha não tiver o formato exigido', () => {
      const { result } = renderHook(() => useFieldValidation(['password']));

      act(() => {
        result.current.getPasswordValue('senhafraca');
      });

      act(() => {
        result.current.validateRequiredFields();
      });

      expect(result.current.errorPassword).toContain('pelo menos 8 caracteres');
    });

    it('deve reportar erro quando a senha for apenas espaços em branco', () => {
      const { result } = renderHook(() => useFieldValidation(['password']));

      act(() => {
        result.current.getPasswordValue('   ');
      });

      act(() => {
        result.current.validateRequiredFields();
      });

      expect(result.current.errorPassword).toBe('Dado incorreto. Revise e digite novamente.');
    });

    it('deve reportar erro quando a confirmação de senha não coincidir', () => {
      const { result } = renderHook(() => useFieldValidation(['confirmPassword']));

      act(() => {
        result.current.getPasswordValue('Senha@123');
        result.current.getConfirmPasswordValue('Senha@456');
      });

      act(() => {
        result.current.validateRequiredFields();
      });

      expect(result.current.errorConfirmPassword).toBe(
        'As senhas não coincidem. Revise e digite novamente.',
      );
    });
  });

  describe('onClick', () => {
    it('deve limpar o erro de nome de usuário', () => {
      const { result } = renderHook(() => useFieldValidation(['userName']));

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorUserName).toBeDefined();

      act(() => {
        result.current.onClick('username');
      });

      expect(result.current.errorUserName).toBeUndefined();
    });

    it('deve limpar o erro de senha', () => {
      const { result } = renderHook(() => useFieldValidation(['password']));

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorPassword).toBeDefined();

      act(() => {
        result.current.onClick('password');
      });

      expect(result.current.errorPassword).toBeUndefined();
    });

    it('deve limpar o erro de confirmação de senha', () => {
      const { result } = renderHook(() => useFieldValidation(['confirmPassword']));

      act(() => {
        result.current.getPasswordValue('Senha@123');
        result.current.getConfirmPasswordValue('diferente');
      });

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorConfirmPassword).toBeDefined();

      act(() => {
        result.current.onClick('confirmPassword');
      });

      expect(result.current.errorConfirmPassword).toBeUndefined();
    });

    it('deve limpar apenas o erro do campo informado', () => {
      const { result } = renderHook(() => useFieldValidation(['email', 'password']));

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorEmail).toBeDefined();
      expect(result.current.errorPassword).toBeDefined();

      act(() => {
        result.current.onClick('email');
      });

      expect(result.current.errorEmail).toBeUndefined();
      expect(result.current.errorPassword).toBeDefined();
    });

    it('deve limpar todos os erros quando nenhum campo específico for informado', () => {
      const { result } = renderHook(() =>
        useFieldValidation(['userName', 'email', 'password', 'confirmPassword']),
      );

      act(() => {
        result.current.validateRequiredFields();
      });

      act(() => {
        result.current.onClick('outro-valor');
      });

      expect(result.current.errorUserName).toBeUndefined();
      expect(result.current.errorEmail).toBeUndefined();
      expect(result.current.errorPassword).toBeUndefined();
      expect(result.current.errorConfirmPassword).toBeUndefined();
    });
  });
});
