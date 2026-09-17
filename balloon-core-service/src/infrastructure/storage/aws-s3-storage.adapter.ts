import { Injectable } from "@nestjs/common";
import { StoragePort } from "../../application/ports/storage.port";

@Injectable()
export class AwsS3StorageAdapter implements StoragePort {

  getPublicUrl(key: string): string {
    return (
      `${process.env.AWS_CLOUDFRONT_CDN_URL}` +
      `/${process.env.AWS_S3_BUCKET_NAME}` +
      `/${key}`
    );
  }
  
}