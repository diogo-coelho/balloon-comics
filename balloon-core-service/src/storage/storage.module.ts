import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { AwsS3Service } from "./aws-s3.service";
@Module({
  imports: [],
  controllers: [],
  providers: [{
    provide: StorageService,
    useClass: AwsS3Service,
  }],
  exports: [StorageService],
})
export class StorageModule {}