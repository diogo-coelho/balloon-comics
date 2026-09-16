export interface AuthTransactionalPort {
  users: UserRepositoryPort;
  outbox: OutboxRepositoryPort;
}

export type AccessTokenPayload = {
  userId: string;
  username: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  }
}

export type TokenPayload = {
  sub: string;
  tokenType: 'access' | 'refresh';
  username?: string;
  email?: string;
}

export type RefreshTokenInput = {
  refreshToken: string;
}

export type RefreshTokenOutput = {
  accessToken: string;
  refreshToken: string;
}