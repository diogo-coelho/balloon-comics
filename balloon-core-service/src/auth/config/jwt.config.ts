import { registerAs } from '@nestjs/config';
import { JwtSecretError } from '../error/jwt-secret.error';
import { JwtAudienceError } from '../error/jwt-audience.error';
import { JwtIssuerError } from '../error/jwt-issuer.error';

export default registerAs('jwt', () => {
  if (!process.env.JWT_SECRET) {
    throw new JwtSecretError(
      'Segredo do JWT não foi configurado. Por favor, configure a variável de ambiente JWT_SECRET.',
    );
  }

  if (!process.env.JWT_TOKEN_AUDIENCE) {
    throw new JwtAudienceError(
      'Audience do JWT não foi configurado. Por favor, configure a variável de ambiente JWT_TOKEN_AUDIENCE.',
    );
  }

  if (!process.env.JWT_TOKEN_ISSUER) {
    throw new JwtIssuerError(
      'Issuer do JWT não foi configurado. Por favor, configure a variável de ambiente JWT_TOKEN_ISSUER.',
    );
  }

  return {
    secret: process.env.JWT_SECRET as string,
    audience: process.env.JWT_TOKEN_AUDIENCE as string,
    issuer: process.env.JWT_TOKEN_ISSUER as string,
  };
});
