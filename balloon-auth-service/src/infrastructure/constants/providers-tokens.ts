export const PROVIDERS_TOKENS = {
  USER_REPOSITORY: Symbol('UserRepository'),
  PASSWORD_HASHER: Symbol('PasswordHasher'),
  TOKEN_SERVICE: Symbol('TOKEN_SERVICE'),
  AUTH_UNIT_OF_WORK: Symbol('AuthUnitOfWork'),
} as const;