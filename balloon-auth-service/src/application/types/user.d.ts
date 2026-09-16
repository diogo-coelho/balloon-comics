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

export type UpdateUserInput = {
  id: string;
  requesterId: string;
  username?: string;
  email?: string;
  password?: string;
};

export type DeleteUserInput = {
  id: string;
  requesterId: string;
}
