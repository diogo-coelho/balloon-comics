export default class UserNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotAllowedError';
  }
}
