import { Reader } from '../../../../domain/reader/entities/reader';
import { ReaderOrmEntity } from '../entities/reader.orm-entity';

export class ReaderOrmMapper {
  static toDomain(entity: ReaderOrmEntity): Reader {
    return new Reader(
      entity.id,
      entity.userId,
      entity.email,
      entity.username,
      entity.name ?? entity.username,
      entity.imageUrl ?? null,
      entity.description ?? null,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
