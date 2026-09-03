import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository.js';

import { SocialMediaLinkService } from '../social-media-link.service';
import { SocialMediaLinkEntity } from '../entities/social-media-link.entity';
import { SocialMediaLinkMapper } from '../mappers/social-media-link.mapper';
import { CreateSocialMediaLinkDto } from '../dtos/request/create-social-media-link.dto';
import { ResponseSocialMediaLinkDto } from '../dtos/response/response-social-media-link.dto';
import { SocialMediaTypeEnum } from '../enums/social-media-type.enum';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('SocialMediaLinkService', () => {
  let service: SocialMediaLinkService;
  let repository: jest.Mocked<Repository<SocialMediaLinkEntity>>;
  let mapper: jest.Mocked<SocialMediaLinkMapper>;

  const reader = { id: 'reader-id' } as ReaderEntity;

  const socialMediaLink: SocialMediaLinkEntity = {
    id: 'social-media-link-id',
    reader,
    name: SocialMediaTypeEnum.FACEBOOK,
    url: 'https://facebook.com/usuario',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SocialMediaLinkEntity;

  const responseDto: ResponseSocialMediaLinkDto = {
    id: socialMediaLink.id,
    readerId: reader.id,
    name: socialMediaLink.name,
    url: socialMediaLink.url,
    createdAt: socialMediaLink.createdAt,
    updatedAt: socialMediaLink.updatedAt,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialMediaLinkService,
        {
          provide: getRepositoryToken(SocialMediaLinkEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: SocialMediaLinkMapper,
          useValue: {
            toModelFromEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SocialMediaLinkService);
    repository = module.get(getRepositoryToken(SocialMediaLinkEntity));
    mapper = module.get(SocialMediaLinkMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSocialMediaLinkByReaderIdAndName', () => {
    it('deve retornar o modelo mapeado quando a rede social existir', async () => {
      repository.findOne.mockResolvedValue(socialMediaLink);
      mapper.toModelFromEntity.mockReturnValue(responseDto);

      const result = await service.getSocialMediaLinkByReaderIdAndName(
        reader,
        SocialMediaTypeEnum.FACEBOOK,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          reader: { id: reader.id },
          name: SocialMediaTypeEnum.FACEBOOK,
        },
      });
      expect(result).toBe(responseDto);
    });

    it('deve retornar null quando não houver rede social para o leitor', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.getSocialMediaLinkByReaderIdAndName(
        reader,
        SocialMediaTypeEnum.FACEBOOK,
      );

      expect(result).toBeNull();
      expect(mapper.toModelFromEntity).not.toHaveBeenCalled();
    });
  });

  describe('createSocialMediaLink', () => {
    it('deve criar e salvar a rede social vinculada ao leitor', async () => {
      const createSocialMediaLinkDto: CreateSocialMediaLinkDto = {
        name: SocialMediaTypeEnum.FACEBOOK,
        url: socialMediaLink.url,
      };
      repository.create.mockReturnValue(socialMediaLink);
      repository.save.mockResolvedValue(socialMediaLink);
      mapper.toModelFromEntity.mockReturnValue(responseDto);

      const result = await service.createSocialMediaLink(
        reader,
        createSocialMediaLinkDto,
      );

      expect(repository.create).toHaveBeenCalledWith({
        reader: { id: reader.id },
        name: createSocialMediaLinkDto.name,
        url: createSocialMediaLinkDto.url,
      });
      expect(repository.save).toHaveBeenCalledWith(socialMediaLink);
      expect(mapper.toModelFromEntity).toHaveBeenCalledWith(socialMediaLink);
      expect(result).toBe(responseDto);
    });
  });
});
