import { randomUUID } from "node:crypto";

export class User {

  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly eventVersion: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(props: { username: string; email: string; passwordHash: string }): User {
    const now = new Date();

    return new User(
      randomUUID(),
      props.username,
      props.email,
      props.passwordHash,
      1,
      now,
      now
    );
  }
  
}