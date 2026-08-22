export class PasswordNotMatchError extends Error {
  private status: number; 

  constructor() {
    super(`Password does not match`);
    this.name = 'PasswordNotMatchError';
    this.stack = (new Error()).stack;
    this.status = 400;
  }

  getStatus(): number {
    return this.status;
  }
  
}