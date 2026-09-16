import { randomUUID } from "node:crypto";

export class User {

  constructor(
    public id: string,
    public username: string,
    public email: string,
    public passwordHash: string,
    public eventVersion: number,
    public createdAt: Date,
    public updatedAt: Date
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
  
  update(input: { username?: string; email?: string; }): boolean {
    let integrationDataChanged = false;

    if (input.username !== undefined && input.username !== this.username) {
      this.username = input.username;
      integrationDataChanged = true;
    }

    if (input.email !== undefined && input.email !== this.email) {
      this.email = input.email;
      integrationDataChanged = true;
    }

    if (integrationDataChanged) {
      this.eventVersion++;
    }

    this.updatedAt = new Date();
    return integrationDataChanged;
  }

  changePasswordHash(
    passwordHash: string,
  ): void {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }
}