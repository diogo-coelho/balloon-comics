import { renderHook, act } from '@testing-library/react';
import useReader from '@/hooks/useReader';

describe('useReader', () => {
  describe('validateRequiredFields', () => {
    it('deve retornar false quando o nome completo estiver vazio', () => {
      const { result } = renderHook(() => useReader(['fullName']));

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorFullName).toBeDefined();
    });

    it('deve retornar true quando o nome completo for válido', () => {
      const { result } = renderHook(() => useReader(['fullName']));

      act(() => {
        result.current.setFullName('Usuário Teste');
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(true);
      expect(result.current.errorFullName).toBeUndefined();
    });

    it('deve validar a biografia apenas quando ela não estiver vazia após o trim', () => {
      const { result } = renderHook(() => useReader(['biography']));

      act(() => {
        result.current.setBiography('   ');
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorBiography).toBeDefined();
    });

    it('deve considerar a biografia válida quando estiver vazia', () => {
      const { result } = renderHook(() => useReader(['biography']));

      let isValid = false;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(true);
    });

    it('deve reportar erro quando algum link não possuir nome ou url', () => {
      const { result } = renderHook(() => useReader(['links']));

      act(() => {
        result.current.setLinks([{ name: '', label: 'Facebook', url: 'https://facebook.com' }]);
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorLinks).toBe('Dado incorreto. Revise e digite novamente.');
    });

    it('deve reportar erro quando a url do link for inválida', () => {
      const { result } = renderHook(() => useReader(['links']));

      act(() => {
        result.current.setLinks([{ name: 'facebook', label: 'Facebook', url: 'não é uma url' }]);
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorLinks).toContain('formato inválido');
    });

    it('deve considerar válido quando não houver links informados', () => {
      const { result } = renderHook(() => useReader(['links']));

      let isValid = false;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(true);
    });

    it('deve reportar erro quando a data de nascimento estiver em formato inválido', () => {
      const { result } = renderHook(() => useReader(['dateOfBirth']));

      act(() => {
        result.current.setDateOfBirth('01/01/2000');
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorDateOfBirth).toContain('inválida');
    });

    it('deve reportar erro quando a data de nascimento for apenas espaços em branco', () => {
      const { result } = renderHook(() => useReader(['dateOfBirth']));

      act(() => {
        result.current.setDateOfBirth('   ');
      });

      let isValid = true;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(false);
      expect(result.current.errorDateOfBirth).toBe('Dado incorreto. Revise e digite novamente.');
    });

    it('deve considerar válida a ausência de data de nascimento', () => {
      const { result } = renderHook(() => useReader(['dateOfBirth']));

      let isValid = false;
      act(() => {
        isValid = result.current.validateRequiredFields();
      });

      expect(isValid).toBe(true);
    });
  });

  describe('onClick', () => {
    it('deve limpar apenas o erro do campo informado', () => {
      const { result } = renderHook(() => useReader(['fullName', 'biography']));

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorFullName).toBeDefined();

      act(() => {
        result.current.onClick('fullName');
      });

      expect(result.current.errorFullName).toBeUndefined();
    });

    it('deve limpar o erro de biografia', () => {
      const { result } = renderHook(() => useReader(['biography']));

      act(() => {
        result.current.setBiography('   ');
      });

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorBiography).toBeDefined();

      act(() => {
        result.current.onClick('biography');
      });

      expect(result.current.errorBiography).toBeUndefined();
    });

    it('deve limpar o erro de links', () => {
      const { result } = renderHook(() => useReader(['links']));

      act(() => {
        result.current.setLinks([{ name: '', label: 'Facebook', url: '' }]);
      });

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorLinks).toBeDefined();

      act(() => {
        result.current.onClick('links');
      });

      expect(result.current.errorLinks).toBeUndefined();
    });

    it('deve limpar o erro de data de nascimento', () => {
      const { result } = renderHook(() => useReader(['dateOfBirth']));

      act(() => {
        result.current.setDateOfBirth('01/01/2000');
      });

      act(() => {
        result.current.validateRequiredFields();
      });
      expect(result.current.errorDateOfBirth).toBeDefined();

      act(() => {
        result.current.onClick('dateOfBirth');
      });

      expect(result.current.errorDateOfBirth).toBeUndefined();
    });

    it('deve limpar todos os erros quando nenhum campo específico for informado', () => {
      const { result } = renderHook(() => useReader(['fullName']));

      act(() => {
        result.current.validateRequiredFields();
      });

      act(() => {
        result.current.onClick('outro-valor');
      });

      expect(result.current.errorFullName).toBeUndefined();
      expect(result.current.errorBiography).toBeUndefined();
      expect(result.current.errorLinks).toBeUndefined();
      expect(result.current.errorDateOfBirth).toBeUndefined();
    });
  });
});
