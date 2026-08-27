import { Test, TestingModule } from '@nestjs/testing';

import { ReaderController } from '../reader.controller';
import { ReaderService } from '../reader.service';
import { AuthTokenGuard } from '../../auth/guards/auth-token.guard';
import { TokenPayloadDto } from '../../auth/dtos/request/token-payload.dto';
import { RequestReaderDto } from '../dtos/request/request-reader.dto';
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
            createReader: jest.fn(),
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

  describe('createReader', () => {
    const requestReaderDto: RequestReaderDto = {
      name: 'Nome do leitor',
      imageUrl: 'http://imagem.com/foto.png',
      description: 'Descrição do leitor',
    };

    it('deve montar o CreateReaderDto a partir do token e delegar para o ReaderService', async () => {
      const response: ResponseReaderDto = {
        message: 'Leitor criado com sucesso',
        data: { id: 'reader-id' },
      };
      readerService.createReader.mockResolvedValue(response);

      const result = await readerController.createReader(
        tokenPayload,
        requestReaderDto,
      );

      expect(readerService.createReader).toHaveBeenCalledWith({
        userId: tokenPayload.sub,
        email: tokenPayload.email,
        username: tokenPayload.username,
        ...requestReaderDto,
      });
      expect(result).toBe(response);
    });
  });
});
