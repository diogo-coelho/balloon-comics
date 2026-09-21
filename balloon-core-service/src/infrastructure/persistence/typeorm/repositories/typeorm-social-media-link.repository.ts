import { Repository } from 'typeorm';
import { SocialmediaLinkRepositoryPort } from '../../../../application/ports/social-media-link.repository.port';
import { SocialMediaLink } from '../../../../domain/social-media-link/entities/social-media-link';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialMediaLinkOrmEntity } from '../entities/social-media-link.orm-entity';
import { SocialMediaLinkOrmMapper } from '../mappers/social-media-link.orm-mapper';
import { Injectable } from '@nestjs/common';
import { ReaderOrmEntity } from '../entities/reader.orm-entity';

@Injectable()
export class TypeOrmSocialMediaLinkRepository implements SocialmediaLinkRepositoryPort {
  constructor(
    @InjectRepository(SocialMediaLinkOrmEntity)
    private readonly repository: Repository<SocialMediaLinkOrmEntity>,
  ) {}

  async findByReaderId(readerId: string): Promise<SocialMediaLink[]> {
    const entities = await this.repository.findBy({ reader: { id: readerId } });

    return entities.map(SocialMediaLinkOrmMapper.toDomain);
  }

  async findByReaderIdAndName(
    readerId: string,
    name: string,
  ): Promise<SocialMediaLink | null> {
    const entity = await this.repository.findOneBy({
      reader: { id: readerId },
      name,
    });

    return entity ? SocialMediaLinkOrmMapper.toDomain(entity) : null;
  }

  async saveMany(links: SocialMediaLink[]): Promise<SocialMediaLink[]> {
    if (links.length === 0) return [];

    const entities = links.map((link) => {
      const entity = new SocialMediaLinkOrmEntity();
      entity.id = link.id;
      entity.reader = { id: link.readerId } as ReaderOrmEntity;
      entity.name = link.name;
      entity.url = link.url;
      entity.createdAt = link.createdAt;
      entity.updatedAt = link.updatedAt;
      return entity;
    });
    await this.repository.save(entities);

    return links;
  }
}
