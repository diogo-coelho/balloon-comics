export interface AuthTransactionalPort {
  users: UserRepositoryPort;
  outbox: OutboxRepositoryPort;
}