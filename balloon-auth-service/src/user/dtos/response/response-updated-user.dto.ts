type UserData = {
  id?: string;
  username?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ResponseUpdatedUserDto {
  message?: string;
  data?: UserData;
  next?: string;
  statusCode?: number;
  error?: Error | undefined | any;
}