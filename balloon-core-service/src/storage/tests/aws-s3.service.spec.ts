import { AwsS3Service } from '../aws-s3.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('fixed-uuid'),
}));

describe('AwsS3Service', () => {
  let service: AwsS3Service;

  const file = {
    originalname: 'avatar.png',
    buffer: Buffer.from('file-content'),
    mimetype: 'image/png',
  } as Express.Multer.File;

  beforeEach(() => {
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET_NAME = 'balloon-bucket';
    process.env.AWS_CLOUDFRONT_CDN_URL = 'https://cdn.balloon.com';
    process.env.AWS_S3_ENDPOINT = '';

    service = new AwsS3Service();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('deve enviar o arquivo para o s3 e retornar a chave gerada', async () => {
      sendMock.mockResolvedValue({});

      const key = await service.uploadFile(file, 'readers');

      expect(key).toBe('readers/fixed-uuid-avatar.png');
      expect(sendMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPublicUrl', () => {
    it('deve montar a url pública a partir da chave informada', () => {
      const url = service.getPublicUrl('readers/fixed-uuid-avatar.png');

      expect(url).toBe(
        'https://cdn.balloon.com/balloon-bucket/readers/fixed-uuid-avatar.png',
      );
    });
  });
});
