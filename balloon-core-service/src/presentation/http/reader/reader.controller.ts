import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetReaderUseCase } from '../../../application/reader/use-cases/get-reader.use-case';
import { AuthTokenGuard } from '../guards/auth-token.guard';
import { TokenPayloadDto } from '../dtos/token-payload.dto';
import { TokenPayloadParam } from '../decorators/token-payload.decorator';
import { ResponseReaderDto } from './dtos/response/response-reader.dto';
import { UploadReaderImageUseCase } from '../../../application/reader/use-cases/upload-reader-image.use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileData } from '../../../application/types/file';
import { UpdateReaderUseCase } from '../../../application/reader/use-cases/update-reader.use-case';
import { UpdateReaderDto } from './dtos/request/update-reader.dto';

@Controller('readers')
export class ReaderController {
  constructor(
    private readonly getReader: GetReaderUseCase,
    private readonly uploadReaderImage: UploadReaderImageUseCase,
    private readonly updateReader: UpdateReaderUseCase,
  ) {}

  @UseGuards(AuthTokenGuard)
  @Get('/me')
  async getCurrentReader(
    @TokenPayloadParam()
    tokenPayload: TokenPayloadDto,
  ): Promise<ResponseReaderDto> {
    const data = await this.getReader.execute(tokenPayload.sub);

    return {
      message: 'Leitor encontrado com sucesso',
      data,
    };
  }

  @UseGuards(AuthTokenGuard)
  @Patch('/me')
  async updateCurrentReader(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() dto: UpdateReaderDto,
  ) {
    const data = await this.updateReader.execute({
      userId: tokenPayload.sub,
      ...dto,
    });

    return {
      message: 'Leitor atualizado com sucesso',
      data,
    };
  }

  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/me/image')
  async uploadImage(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ResponseReaderDto> {
    const fileData: FileData = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
    const data = await this.uploadReaderImage.execute({
      userId: tokenPayload.sub,
      file: fileData,
    });

    return {
      message: 'Imagem do leitor atualizada com sucesso',
      data,
    };
  }
}
