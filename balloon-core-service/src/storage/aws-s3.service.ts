import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { StorageService } from "./storage.service";

@Injectable()
export class AwsS3Service implements StorageService {

  private readonly storage: S3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(!!process.env.AWS_S3_ENDPOINT),
  });
  
  async uploadFile(file: Express.Multer.File, object: string) {
    const extension = file.originalname.split('.').pop();
    const filename = file.originalname.split('.').shift();
    const key = `${object}/${randomUUID()}-${filename}.${extension}`;
  
    await this.storage.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
      
    return key;
  }
  
  getPublicUrl(key: string): string {
    return `${process.env.AWS_CLOUDFRONT_CDN_URL}/${process.env.AWS_S3_BUCKET_NAME}/${key}`;
  }

}