export class ResponseUserDto {
  message?: string;
  data?: {
    accessToken?: string;
  };
  next?: string;
  statusCode?: number;
  error?: Error | undefined | any;
}