export class ResponseReaderDto {
  message?: string;
  data?: {
    id?: string;
    email?: string;
    username?: string;
    name?: string;
    imageUrl?: string;
    description?: string;
  };
  next?: string;
}
