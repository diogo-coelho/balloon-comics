import { SocialMediaLinkMapper } from '../mappers/social-media-link.mapper';
import { SocialMediaLinkEntity } from '../entities/social-media-link.entity';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('SocialMediaLinkMapper', () => {
  let mapper: SocialMediaLinkMapper;

  beforeEach(() => {
    mapper = new SocialMediaLinkMapper();
  });

  describe('toModelFromEntity', () => {
    it('deve mapear a entidade de rede social para o modelo de resposta', () => {
      const entity: SocialMediaLinkEntity = {
        id: 'social-media-link-id',
        reader: { id: 'reader-id' } as ReaderEntity,
        name: 'facebook',
        url: 'https://facebook.com/usuario',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as SocialMediaLinkEntity;

      const result = mapper.toModelFromEntity(entity);

      expect(result).toEqual({
        id: entity.id,
        readerId: entity.reader.id,
        name: entity.name,
        url: entity.url,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });
  });
});
