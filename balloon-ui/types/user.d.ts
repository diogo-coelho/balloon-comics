export type CreateUserData = {
  username: string;
  email: string;
  password: string;
}

export type UserData = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
