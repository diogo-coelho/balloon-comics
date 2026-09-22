export type AccessTokenPayload = {
  sub: string;
  username?: string;
  email?: string;
  tokenType: 'access';
};

export abstract class AccessTokenVerifierPort {
  abstract verify(token: string): Promise<AccessTokenPayload>;
}
