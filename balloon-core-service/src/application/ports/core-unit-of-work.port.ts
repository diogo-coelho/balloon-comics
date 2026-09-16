import { CoreTransactionalPort } from "./core-transactional.port";

export interface CoreUnitOfWorkPort {
  execute<T>(
    operation: (
      transaction: CoreTransactionalPort,
    ) => Promise<T>
  ): Promise<T>
}