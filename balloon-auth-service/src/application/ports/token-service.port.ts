import { AccessTokenPayload, TokenPayload } from "../types/auth";

export interface TokenServicePort {

  generateAccessToken(payload: AccessTokenPayload): Promise<string>;

  generateRefreshToken(userId: string): Promise<string>;

  verify(token: string): Promise<TokenPayload>;

}