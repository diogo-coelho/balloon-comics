export class AuthDataDto {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
  }
  next?: string;
}