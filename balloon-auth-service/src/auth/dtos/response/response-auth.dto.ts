export class ResponseAuthDto {
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  next?: string;
}
