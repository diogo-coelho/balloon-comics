import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AgeVerificationService } from './age-verification.service';
import { CreateAgeVerificationDto } from './dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from './dtos/response/response-age-verification.dto';
import { ReaderEntity } from '../reader/entities/reader.entity';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';

@Controller('age-verification')
export class AgeVerificationController {

  constructor(private readonly ageVerificationService: AgeVerificationService) {}

  @UseGuards(AuthTokenGuard)
  @Post('/reader/:id')
  async createAgeVerification(
    @Param('id') readerId: string,
    @Body() createAgeVerificationDto: CreateAgeVerificationDto,
  ): Promise<ResponseAgeVerificationDto> {
    return this.ageVerificationService.createAgeVerification(readerId, createAgeVerificationDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get('/reader/:id')
  async getAgeVerificationByReaderId(
    @Param('id') readerId: string,
  ): Promise<ResponseAgeVerificationDto | null> {
    return this.ageVerificationService.getAgeVerificationByReaderId({ id: readerId } as ReaderEntity);
  }

}