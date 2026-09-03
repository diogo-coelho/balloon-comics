import { Test, TestingModule } from '@nestjs/testing';

import { SocialMediaLinkController } from '../social-media-link.controller';
import { SocialMediaLinkService } from '../social-media-link.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { ResponseSocialMediaLinkDto } from '../dtos/response/response-social-media-link.dto';
import { SocialMediaTypeEnum } from '../enums/social-media-type.enum';
import { ReaderEntity } from '../../reader/entities/reader.entity';

describe('SocialMediaLinkController', () => {
  let controller: SocialMediaLinkController;
  let service: jest.Mocked<SocialMediaLinkService>;

  const responseDto: ResponseSocialMediaLinkDto = {
    id: 'social-media-link-id',
    readerId: 'reader-id',
    name: SocialMediaTypeEnum.FACEBOOK,
    url: 'https://facebook.com/usuario',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediaLinkController],
      providers: [
        {
          provide: SocialMediaLinkService,
          useValue: {
            getSocialMediaLinkByReaderIdAndName: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get(SocialMediaLinkController);
    service = module.get(SocialMediaLinkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSocialMediaLinksByReaderId', () => {
    it('deve delegar a busca pela rede social a partir do id do leitor e do nome', async () => {
      service.getSocialMediaLinkByReaderIdAndName.mockResolvedValue(responseDto);

      const result = await controller.getSocialMediaLinksByReaderId(
        'reader-id',
        SocialMediaTypeEnum.FACEBOOK,
      );

      expect(service.getSocialMediaLinkByReaderIdAndName).toHaveBeenCalledWith(
        { id: 'reader-id' } as ReaderEntity,
        SocialMediaTypeEnum.FACEBOOK,
      );
      expect(result).toBe(responseDto);
    });
  });
});
