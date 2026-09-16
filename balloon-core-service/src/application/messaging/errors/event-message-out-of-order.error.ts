export class EventMessageOutOfOrder extends Error {
  constructor(aggregateId: string, expectedVersion: number, aggregateVersion: number) {
    super(`Evento fora de ordem. \n
          Aggregate: ${aggregateId}. \n
          Esperado: ${expectedVersion}. \n
          Recebido: ${aggregateVersion}.
      `);
    this.name = 'EventMessageOutOfOrder';
  }
}