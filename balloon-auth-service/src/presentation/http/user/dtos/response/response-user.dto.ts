export class ResponseUserDto {
  message!: string;
  data!: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}