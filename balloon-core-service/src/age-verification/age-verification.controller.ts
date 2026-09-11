import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AgeVerificationService } from './age-verification.service';
import { CreateAgeVerificationDto } from './dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from './dtos/response/response-age-verification.dto';
import { ReaderEntity } from '../reader/entities/reader.entity';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';
import { TokenPayloadParam } from '../auth/decorators/token-payload.decorator';

@Controller('age-verification')
export class AgeVerificationController {
  constructor(
    private readonly ageVerificationService: AgeVerificationService,
  ) {}

  @UseGuards(AuthTokenGuard)
  @Post('/reader/me')
  async createAgeVerification(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createAgeVerificationDto: CreateAgeVerificationDto,
  ): Promise<ResponseAgeVerificationDto> {
    const { sub: readerId } = tokenPayload;
    return this.ageVerificationService.createAgeVerification(
      readerId,
      createAgeVerificationDto,
    );
  }

  @UseGuards(AuthTokenGuard)
  @Get('/reader/me')
  async getAgeVerificationByReaderId(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ): Promise<ResponseAgeVerificationDto | null> {
    const { sub: readerId } = tokenPayload;
    return this.ageVerificationService.getAgeVerificationByReaderId({
      id: readerId,
    } as ReaderEntity);
  }
}
