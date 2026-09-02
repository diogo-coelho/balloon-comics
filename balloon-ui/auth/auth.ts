import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { importSPKI, jwtVerify } from 'jose';

let publicKeyPromise: ReturnType<typeof importSPKI> | undefined;

function getPublicKey() {
  const publicKeyPath = process.env.JWT_PUBLIC_KEY;

  if (!publicKeyPath) {
    throw new Error('JWT_PUBLIC_KEY não foi configurada.');
  }

  publicKeyPromise ??= readFile(resolve(process.cwd(), publicKeyPath), 'utf8').then(
    (publicKeyPem) => importSPKI(publicKeyPem, 'RS256'),
  );

  return publicKeyPromise;
}

export async function verifyToken(token: string) {
  const publicKey = await getPublicKey();

  try {
    return await jwtVerify(token, publicKey, { algorithms: ['RS256'] });
  } catch {
    throw new Error('Token inválido');
  }
}