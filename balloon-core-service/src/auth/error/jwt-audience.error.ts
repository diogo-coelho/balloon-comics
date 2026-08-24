export class JwtAudienceError extends Error {
  private status: number; 

  constructor(message?: string) {
    super(message || `JWT audience is not configured`);
    this.name = 'JwtAudienceError';
    this.stack = (new Error()).stack;
    this.status = 400;
  }

  getStatus(): number {
    return this.status;
  }
  
}