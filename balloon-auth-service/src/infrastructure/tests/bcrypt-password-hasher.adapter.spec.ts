import { BcryptPasswordHasherAdapter } from '../security/bcrypt-password-hasher.adapter';

describe('BcryptPasswordHasherAdapter', () => {
  it('deve gerar e comparar hashes de senha', async () => {
    const adapter = new BcryptPasswordHasherAdapter();
    const hash = await adapter.hash('senha-segura');

    await expect(adapter.compare('senha-segura', hash)).resolves.toBe(true);
    await expect(adapter.compare('senha-incorreta', hash)).resolves.toBe(false);
  });
});
