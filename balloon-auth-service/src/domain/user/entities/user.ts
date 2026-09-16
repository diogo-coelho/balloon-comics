import { randomUUID } from "node:crypto";

export class User {
  private refreshTokenHash?: string | null;

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
  
  public update(input: { username?: string; email?: string; }): boolean {
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

  public changePasswordHash(
    passwordHash: string,
  ): void {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  public setRefreshTokenHash(hash: string): void {
    this.refreshTokenHash = hash;
    this.updatedAt = new Date();
  }

  public getRefreshTokenHash(): string | null | undefined {
    return this.refreshTokenHash;
  }

  public clearRefreshTokenHash(): void {
    this.refreshTokenHash = null;
    this.updatedAt = new Date();
  }

}