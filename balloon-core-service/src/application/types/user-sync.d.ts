export type UserCreatedEventData = {
  userId: string;
  username: string;
  email: string;
};

export type UserUpdatedEventData = {
  userId: string;
  username: string;
  email: string;
};

export type UserDeletedEventData = {
  userId: string;
};