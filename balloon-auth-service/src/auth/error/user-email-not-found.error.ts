export class UserEmailNotFoundError extends Error {
  private status: number;

  constructor(email: string) {
    super(`User with email ${email} not found`);
    this.name = 'UserEmailNotFoundError';
    this.cause = { email };
    this.stack = (new Error()).stack;
    this.status = 404;
  }

  getStatus(): number {
    return this.status;
  }
}