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
    entity.refreshTokenHash = user.getRefreshTokenHash();
    entity.eventVersion = user.eventVersion;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }

  static toDomain(
    entity: UserOrmEntity,
  ): User { 
    const user = new User(
      entity.id,
      entity.username,
      entity.email,
      entity.passwordHash,
      entity.eventVersion,
      entity.createdAt,
      entity.updatedAt
    );

    return user;
  }
  
}