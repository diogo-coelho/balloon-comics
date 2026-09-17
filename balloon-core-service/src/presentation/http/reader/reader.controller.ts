import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetReaderUseCase } from "../../../application/reader/use-cases/get-reader.use-case";
import { AuthTokenGuard } from "../guards/auth-token.guard";
import { TokenPayloadDto } from "../dtos/token-payload.dto";
import { TokenPayloadParam } from "../decorators/token-payload.decorator";
import { ResponseReaderDto } from "./dtos/response/response-reader.dto";

@Controller('readers')
export class ReaderController {

  constructor(
    private readonly getReader: GetReaderUseCase,
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
}