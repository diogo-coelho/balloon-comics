import { Body, Controller, UseGuards, Patch } from '@nestjs/common';
import { ReaderService } from './reader.service';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { TokenPayloadParam } from '../auth/decorators/token-payload.decorator';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';
import { CreateReaderDto } from './dtos/request/create-reader.dto';
import { RequestReaderDto } from './dtos/request/request-reader.dto';

@Controller('readers')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @UseGuards(AuthTokenGuard)
  @Patch('create')
  async createReader(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() requestReaderDto: RequestReaderDto,
  ): Promise<any> {
    const { sub, email, username } = tokenPayload;

    const createReaderDto: CreateReaderDto = {
      userId: sub,
      email,
      username,
      ...requestReaderDto,
    };

    return this.readerService.createReader(createReaderDto);
  }
}
