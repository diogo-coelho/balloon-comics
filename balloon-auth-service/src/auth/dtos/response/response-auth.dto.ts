export class ResponseAuthDto {
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  next?: string;
  statusCode?: number;
  error?: Error | undefined | any;
}