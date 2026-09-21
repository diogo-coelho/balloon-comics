import { AwsS3StorageAdapter } from '../storage/aws-s3-storage.adapter';

describe('AwsS3StorageAdapter', () => {
  const originalCdnUrl = process.env.AWS_CLOUDFRONT_CDN_URL;
  const originalBucketName = process.env.AWS_S3_BUCKET_NAME;

  beforeEach(() => {
    process.env.AWS_CLOUDFRONT_CDN_URL = 'https://cdn.example.com';
    process.env.AWS_S3_BUCKET_NAME = 'balloon-bucket';
  });

  afterAll(() => {
    if (originalCdnUrl === undefined) delete process.env.AWS_CLOUDFRONT_CDN_URL;
    else process.env.AWS_CLOUDFRONT_CDN_URL = originalCdnUrl;

    if (originalBucketName === undefined) delete process.env.AWS_S3_BUCKET_NAME;
    else process.env.AWS_S3_BUCKET_NAME = originalBucketName;
  });

  it('deve enviar o arquivo para o bucket e montar a URL pública', async () => {
    const sent: any[] = [];
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'AWS_S3_ENDPOINT') return undefined;
        if (key === 'AWS_REGION') return 'us-east-1';
        return undefined;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'AWS_REGION') return 'us-east-1';
        if (key === 'AWS_S3_BUCKET_NAME') return 'balloon-bucket';
        throw new Error(`Missing ${key}`);
      }),
    };

    const adapter = new AwsS3StorageAdapter(configService as any);
    const file = {
      originalName: 'avatar.png',
      mimeType: 'image/png',
      size: 123,
      buffer: Buffer.from('image'),
    };

    const s3Client = (adapter as any).storage;
    const originalSend = s3Client.send.bind(s3Client);
    s3Client.send = jest.fn(async (command) => {
      sent.push(command);
      return {};
    });

    const key = await adapter.uploadFile(file, 'readers');
    const publicUrl = adapter.getPublicUrl(key);

    expect(key).toContain('readers/');
    expect(key).toContain('.png');
    expect(sent).toHaveLength(1);
    expect(publicUrl).toContain('https://cdn.example.com');
    expect(publicUrl).toContain('balloon-bucket');
    expect(publicUrl).toContain(key);
    s3Client.send = originalSend;
  });
});
