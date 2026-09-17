export class JwtSecretError extends Error {
  private status: number;

  constructor(message?: string) {
    super(message || `JWT secret is not configured`);
    this.name = 'JwtSecretError';
    this.stack = new Error().stack;
    this.status = 400;
  }

  getStatus(): number {
    return this.status;
  }
}
