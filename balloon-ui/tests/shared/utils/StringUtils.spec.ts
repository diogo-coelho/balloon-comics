import {
  formatNumberToMonetaryValueString,
  isEmpty,
  isEmail,
  hasPasswordValidFormat,
  hasValidUserNameFormat,
  hasValidUrlFormat,
  hasDateOfBirthValidFormat,
} from '@/shared/utils/StringUtils';

describe('StringUtils', () => {
  describe('formatNumberToMonetaryValueString', () => {
    it('deve formatar um número inteiro como valor monetário', () => {
      expect(formatNumberToMonetaryValueString(10)).toBe('R$ 10,00');
    });

    it('deve truncar a parte decimal do número', () => {
      expect(formatNumberToMonetaryValueString(10.9)).toBe('R$ 10,00');
    });
  });

  describe('isEmpty', () => {
    it('deve retornar true para uma string vazia', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('deve retornar true para uma string apenas com espaços', () => {
      expect(isEmpty('   ')).toBe(true);
    });

    it('deve retornar false para uma string com conteúdo', () => {
      expect(isEmpty('conteudo')).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('deve retornar true para um e-mail válido', () => {
      expect(isEmail('usuario@teste.com')).toBe(true);
    });

    it('deve retornar false para um e-mail sem domínio', () => {
      expect(isEmail('usuario@')).toBe(false);
    });

    it('deve retornar false para um e-mail sem @', () => {
      expect(isEmail('usuario.teste.com')).toBe(false);
    });
  });

  describe('hasPasswordValidFormat', () => {
    it('deve retornar false quando o valor for vazio', () => {
      expect(hasPasswordValidFormat('')).toBe(false);
    });

    it('deve retornar true para uma senha com maiúscula, minúscula, número e caractere especial', () => {
      expect(hasPasswordValidFormat('Senha@123')).toBe(true);
    });

    it('deve retornar false para uma senha sem caractere especial', () => {
      expect(hasPasswordValidFormat('Senha123')).toBe(false);
    });

    it('deve retornar false para uma senha menor que 8 caracteres', () => {
      expect(hasPasswordValidFormat('Se@1')).toBe(false);
    });
  });

  describe('hasValidUserNameFormat', () => {
    it('deve retornar false quando o valor for vazio', () => {
      expect(hasValidUserNameFormat('')).toBe(false);
    });

    it('deve retornar true para um nome de usuário válido', () => {
      expect(hasValidUserNameFormat('usuario_123')).toBe(true);
    });

    it('deve retornar false para um nome de usuário com caracteres inválidos', () => {
      expect(hasValidUserNameFormat('usuario@123')).toBe(false);
    });

    it('deve retornar false para um nome de usuário menor que 3 caracteres', () => {
      expect(hasValidUserNameFormat('ab')).toBe(false);
    });
  });

  describe('hasValidUrlFormat', () => {
    it('deve retornar false quando o valor for vazio', () => {
      expect(hasValidUrlFormat('')).toBe(false);
    });

    it('deve retornar true para uma URL válida com protocolo', () => {
      expect(hasValidUrlFormat('https://facebook.com/usuario')).toBe(true);
    });

    it('deve retornar true para uma URL válida sem protocolo', () => {
      expect(hasValidUrlFormat('facebook.com/usuario')).toBe(true);
    });

    it('deve retornar false para uma URL inválida', () => {
      expect(hasValidUrlFormat('não é uma url')).toBe(false);
    });
  });

  describe('hasDateOfBirthValidFormat', () => {
    it('deve retornar false quando o valor for vazio', () => {
      expect(hasDateOfBirthValidFormat('')).toBe(false);
    });

    it('deve retornar true para uma data no formato correto e no passado', () => {
      expect(hasDateOfBirthValidFormat('2000-01-01')).toBe(true);
    });

    it('deve retornar false para uma data no futuro', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(hasDateOfBirthValidFormat(`${futureYear}-01-01`)).toBe(false);
    });

    it('deve retornar false para uma data fora do formato esperado', () => {
      expect(hasDateOfBirthValidFormat('01/01/2000')).toBe(false);
    });
  });
});
