export class ResponseUserDto {
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  next?: string;
}
