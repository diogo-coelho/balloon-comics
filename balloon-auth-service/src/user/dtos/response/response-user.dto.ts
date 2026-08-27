export type UserDto = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
export class ResponseUserDto {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: {
    user: UserDto
  };
  next?: string;
}
