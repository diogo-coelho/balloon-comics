import { Body, Controller, UseGuards, Patch, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

import { ReaderService } from './reader.service';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { TokenPayloadParam } from '../auth/decorators/token-payload.decorator';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';
import { UploadReaderDto } from './dtos/request/upload-reader.dto';
import { ResponseReaderDto } from './dtos/response/response-reader.dto';

@Controller('readers')
export class ReaderController {
  constructor(
    private readonly readerService: ReaderService,
  ) {}

  @UseGuards(AuthTokenGuard)
  @Patch('/me')
  async updateReader(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() uploadReaderDto: UploadReaderDto,
  ): Promise<ResponseReaderDto> {
    const { sub } = tokenPayload;

    const updateReaderDto = {
      userId: sub,
      uploadReaderDto,
    };

    return this.readerService.updateReader(updateReaderDto);
  }

  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/me/image')
  async uploadImage(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseReaderDto> {
    const { sub: userId } = tokenPayload;
    return await this.readerService.uploadImageReader(userId, file);
  }
}
