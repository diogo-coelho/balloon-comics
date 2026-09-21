export default class ReaderNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReaderNotFoundError';
  }
}
