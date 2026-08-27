import { BcryptService } from '../hashing/bcrypt.service';

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(() => {
    bcryptService = new BcryptService();
  });

  describe('hash', () => {
    it('deve gerar um hash diferente da senha original', async () => {
      const senha = 'Senha@123';

      const hash = await bcryptService.hash(senha);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(senha);
    });

    it('deve gerar hashes diferentes para a mesma senha em chamadas distintas', async () => {
      const senha = 'Senha@123';

      const primeiroHash = await bcryptService.hash(senha);
      const segundoHash = await bcryptService.hash(senha);

      expect(primeiroHash).not.toBe(segundoHash);
    });
  });

  describe('compare', () => {
    it('deve retornar true quando a senha corresponder ao hash', async () => {
      const senha = 'Senha@123';
      const hash = await bcryptService.hash(senha);

      const resultado = await bcryptService.compare(senha, hash);

      expect(resultado).toBe(true);
    });

    it('deve retornar false quando a senha não corresponder ao hash', async () => {
      const hash = await bcryptService.hash('Senha@123');

      const resultado = await bcryptService.compare('SenhaErrada@123', hash);

      expect(resultado).toBe(false);
    });
  });
});
