export class JwtIssuerError extends Error {
  private status: number; 

  constructor(message?: string) {
    super(message || `JWT issuer is not configured`);
    this.name = 'JwtIssuerError';
    this.stack = (new Error()).stack;
    this.status = 400;
  }

  getStatus(): number {
    return this.status;
  }
  
}