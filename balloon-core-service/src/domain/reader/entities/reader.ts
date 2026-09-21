import { randomUUID } from 'node:crypto';

export class Reader {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public email: string,
    public username: string,
    public name: string,
    public imageUrl: string | null,
    public description: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(input: {
    userId: string;
    email: string;
    username: string;
  }): Reader {
    const now = new Date();

    return new Reader(
      randomUUID(),
      input.userId,
      input.email,
      input.username,
      input.username,
      null,
      null,
      now,
      now,
    );
  }

  updateProfile(input: { name: string; description?: string }): void {
    this.name = input.name;
    if (input.description !== undefined) {
      this.description = input.description;
    }
    this.updatedAt = new Date();
  }
}
