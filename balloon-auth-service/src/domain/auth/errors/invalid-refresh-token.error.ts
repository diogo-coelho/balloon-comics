export default class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Token de atualização inválido, expirado ou reutilizado');
    this.name = 'InvalidRefreshTokenError';
  }
}
