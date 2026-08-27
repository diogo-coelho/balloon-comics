import { readFileSync } from 'node:fs';
import { registerAs } from '@nestjs/config';

const readKeyFile = (path: string | undefined, variableName: string): string => {
  if (!path) {
    throw new Error(`${variableName} não foi configurada.`);
  }
  return readFileSync(path, 'utf8');
};

export default registerAs('jwt', () => ({
  privateKey: readKeyFile(process.env.JWT_PRIVATE_KEY, 'JWT_PRIVATE_KEY'),
  publicKey: readKeyFile(process.env.JWT_PUBLIC_KEY, 'JWT_PUBLIC_KEY'),
  signOptions: {
    algorithm: 'RS256' as const,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
  },
  verifyOptions: {
    algorithms: ['RS256' as const],
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
  },
  expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION || '3600') ?? 3600,
  refreshTokenExpiresIn:
    parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION || '86400') ?? 86400,
}));
