import { Test, TestingModule } from '@nestjs/testing';

import { ReaderController } from '../reader.controller';
import { ReaderService } from '../reader.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { TokenPayloadDto } from '../../auth/dtos/request/token-payload.dto';
import { UploadReaderDto } from '../dtos/request/upload-reader.dto';
import { ResponseReaderDto } from '../dtos/response/response-reader.dto';

describe('ReaderController', () => {
  let readerController: ReaderController;
  let readerService: jest.Mocked<ReaderService>;

  const tokenPayload: TokenPayloadDto = {
    sub: 'user-id',
    email: 'usuario@teste.com',
    username: 'usuario',
    iat: 0,
    exp: 0,
    aud: 'audience',
    iss: 'issuer',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReaderController],
      providers: [
        {
          provide: ReaderService,
          useValue: {
            getReader: jest.fn(),
            updateReader: jest.fn(),
            uploadImageReader: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    readerController = module.get(ReaderController);
    readerService = module.get(ReaderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReader', () => {
    it('deve delegar para o ReaderService usando o id do usuário no token', async () => {
      const response: ResponseReaderDto = {
        message: 'Leitor recuperado com sucesso',
        data: { id: 'reader-id' },
      };
      readerService.getReader.mockResolvedValue(response);

      const result = await readerController.getReader(tokenPayload);

      expect(readerService.getReader).toHaveBeenCalledWith(tokenPayload.sub);
      expect(result).toBe(response);
    });
  });

  describe('updateReader', () => {
    const uploadReaderDto: UploadReaderDto = {
      name: 'Nome do leitor',
      description: 'Descrição do leitor',
    };

    it('deve montar o payload a partir do id do usuário no token e delegar para o ReaderService', async () => {
      const response: ResponseReaderDto = {
        message: 'Leitor atualizado com sucesso',
        data: { id: 'reader-id' },
      };
      readerService.updateReader.mockResolvedValue(response);

      const result = await readerController.updateReader(
        tokenPayload,
        uploadReaderDto,
      );

      expect(readerService.updateReader).toHaveBeenCalledWith({
        userId: tokenPayload.sub,
        uploadReaderDto,
      });
      expect(result).toBe(response);
    });
  });

  describe('uploadImage', () => {
    it('deve delegar para o ReaderService com o id do usuário e o arquivo enviado', async () => {
      const file = {
        originalname: 'avatar.png',
        buffer: Buffer.from('conteudo'),
        mimetype: 'image/png',
      } as Express.Multer.File;
      const response: ResponseReaderDto = {
        message: 'Imagem do leitor atualizada com sucesso',
        data: {
          id: 'reader-id',
          imageUrl: 'https://cdn.balloon.com/readers/avatar.png',
        },
      };
      readerService.uploadImageReader.mockResolvedValue(response);

      const result = await readerController.uploadImage(tokenPayload, file);

      expect(readerService.uploadImageReader).toHaveBeenCalledWith(
        tokenPayload.sub,
        file,
      );
      expect(result).toBe(response);
    });
  });
});
