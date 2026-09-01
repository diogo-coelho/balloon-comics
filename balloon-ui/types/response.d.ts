export type HttpResponse<T> = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: T;
  next?: string;
  statusCode?: number;
};