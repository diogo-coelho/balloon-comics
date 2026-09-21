import { AuthTransactionalPort } from '../types/auth';

export interface AuthUnitOfWorkPort {
  execute<T>(
    operation: (transaction: AuthTransactionalPort) => Promise<T>,
  ): Promise<T>;
}
