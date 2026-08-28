import { Module } from "@nestjs/common";
import { MediaService } from "./media.service";

@Module({
  imports: [],
  controllers: [],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}