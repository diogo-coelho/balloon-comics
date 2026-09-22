import { TypeOrmAuthUnitOfWork } from '../persistence/typeorm/unit-of-work/typeorm-auth-unit-of-work';
import type { EntityManager } from 'typeorm';

describe('TypeOrmAuthUnitOfWork', () => {
  it('deve executar a operação dentro de uma transação', async () => {
    const transaction = jest.fn(
      <T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> =>
        operation({ getRepository: jest.fn().mockReturnValue({}) } as never),
    );
    const unitOfWork = new TypeOrmAuthUnitOfWork({ transaction } as never);

    const result = await unitOfWork.execute((repositories) => {
      expect(repositories.users).toBeDefined();
      expect(repositories.outbox).toBeDefined();
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(transaction).toHaveBeenCalled();
  });
});
