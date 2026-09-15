import { User } from "../../../../domain/user/entities/user";
import { UserOrmEntity } from "../entities/user.orm-entity";

export class UserOrmMapper {
  static toPersistence(
    user: User,
  ): UserOrmEntity {
    
    const entity = new UserOrmEntity();

    entity.id = user.id;
    entity.username = user.username;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.eventVersion = user.eventVersion;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }

  static toDomain(
    entity: UserOrmEntity,
  ): User { 
    const { passwordHash, refreshTokenHash, ...domainEntity } = entity;
    return domainEntity as unknown as User;
  }
  
}