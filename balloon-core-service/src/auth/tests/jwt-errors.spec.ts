import { JwtAudienceError } from '../error/jwt-audience.error';
import { JwtIssuerError } from '../error/jwt-issuer.error';
import { JwtSecretError } from '../error/jwt-secret.error';

describe('JwtAudienceError', () => {
  it('deve utilizar a mensagem padrão quando nenhuma for fornecida', () => {
    const error = new JwtAudienceError();

    expect(error.name).toBe('JwtAudienceError');
    expect(error.message).toBe('JWT audience is not configured');
    expect(error.getStatus()).toBe(400);
  });

  it('deve utilizar a mensagem informada quando fornecida', () => {
    const error = new JwtAudienceError('audience customizada ausente');

    expect(error.message).toBe('audience customizada ausente');
  });
});

describe('JwtIssuerError', () => {
  it('deve utilizar a mensagem padrão quando nenhuma for fornecida', () => {
    const error = new JwtIssuerError();

    expect(error.name).toBe('JwtIssuerError');
    expect(error.message).toBe('JWT issuer is not configured');
    expect(error.getStatus()).toBe(400);
  });

  it('deve utilizar a mensagem informada quando fornecida', () => {
    const error = new JwtIssuerError('issuer customizado ausente');

    expect(error.message).toBe('issuer customizado ausente');
  });
});

describe('JwtSecretError', () => {
  it('deve utilizar a mensagem padrão quando nenhuma for fornecida', () => {
    const error = new JwtSecretError();

    expect(error.name).toBe('JwtSecretError');
    expect(error.message).toBe('JWT secret is not configured');
    expect(error.getStatus()).toBe(400);
  });

  it('deve utilizar a mensagem informada quando fornecida', () => {
    const error = new JwtSecretError('segredo customizado ausente');

    expect(error.message).toBe('segredo customizado ausente');
  });
});
