export default class EmailAlreadyInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailAlreadyInUseError';
  }
}
