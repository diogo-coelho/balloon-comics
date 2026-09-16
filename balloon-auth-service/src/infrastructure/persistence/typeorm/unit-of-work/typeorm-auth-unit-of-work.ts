import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AuthUnitOfWorkPort } from "../../../../application/ports/auth-unit-of-work.port";
import { AuthTransactionalPort } from "../../../../application/types/auth";
import { TypeOrmUserRepository } from "../repositories/typeorm-user.repository";
import { TypeOrmOutboxRepository } from "../repositories/typeorm-outbox.repository";
import { UserOrmEntity } from "../entities/user.orm-entity";
import { OutboxOrmEntity } from "../entities/outbox-event.orm-entity";

@Injectable()
export class TypeOrmAuthUnitOfWork implements AuthUnitOfWorkPort {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  execute<T>(
    operation: (
      transaction: AuthTransactionalPort
    ) => Promise<T>
  ): Promise<T> {    
    return this.dataSource.transaction(
      async (manager) => {
        const userRepository = new TypeOrmUserRepository(manager.getRepository(UserOrmEntity));

        const outboxRepository = new TypeOrmOutboxRepository(manager.getRepository(OutboxOrmEntity));

        return operation({
          users: userRepository,
          outbox: outboxRepository,
        })
      }
    )
  }
}