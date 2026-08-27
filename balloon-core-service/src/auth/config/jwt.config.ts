import { readFileSync } from 'node:fs';
import { registerAs } from '@nestjs/config';
import { JwtSecretError } from '../error/jwt-secret.error';
import { JwtAudienceError } from '../error/jwt-audience.error';
import { JwtIssuerError } from '../error/jwt-issuer.error';

const readKeyFile = (path: string | undefined, variableName: string): string => {
  if (!path) {
    throw new Error(`${variableName} não foi configurada.`);
  }
  return readFileSync(path, 'utf8');
};

export default registerAs('jwt', () => {
  if (!process.env.JWT_PUBLIC_KEY) {
    throw new JwtSecretError(
      'Chave pública do JWT não foi configurada. Por favor, configure a variável de ambiente JWT_PUBLIC_KEY.',
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
    publicKey: readKeyFile(process.env.JWT_PUBLIC_KEY, 'JWT_PUBLIC_KEY'),
    verifyOptions: {
      algorithms: ['RS256' as const],
      audience: process.env.JWT_TOKEN_AUDIENCE as string,
      issuer: process.env.JWT_TOKEN_ISSUER as string,
    },
  };
});
