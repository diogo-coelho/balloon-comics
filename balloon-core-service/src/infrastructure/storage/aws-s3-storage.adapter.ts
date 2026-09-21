import { Injectable } from '@nestjs/common';
import { StoragePort } from '../../application/ports/storage.port';
import { FileData } from '../../application/types/file';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class AwsS3StorageAdapter implements StoragePort {
  private readonly storage: S3Client;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    this.storage = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
    });
  }

  async uploadFile(file: FileData, object: string): Promise<string> {
    const extension = file.originalName.split('.').pop();
    const filename = file.originalName.split('.').slice(0, -1).join('.');
    const key = `${object}/${randomUUID()}-${filename}.${extension}`;

    await this.storage.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      }),
    );

    return key;
  }

  getPublicUrl(key: string): string {
    return (
      `${process.env.AWS_CLOUDFRONT_CDN_URL}` +
      `/${process.env.AWS_S3_BUCKET_NAME}` +
      `/${key}`
    );
  }
}
