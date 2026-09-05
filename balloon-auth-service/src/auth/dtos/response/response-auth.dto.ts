export class ResponseAuthDto {
  message?: string;
  data?: {
    id: string,
    email: string
  }
  next?: string;
}
