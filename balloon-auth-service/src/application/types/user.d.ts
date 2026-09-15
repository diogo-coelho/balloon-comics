export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};

export type CreateUserOutput = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
};