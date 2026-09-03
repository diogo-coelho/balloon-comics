import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgeVerificationMapper } from './mappers/age-verification.mapper';

import { CreateAgeVerificationDto } from './dtos/request/create-age-verification.dto';
import { ResponseAgeVerificationDto } from './dtos/response/response-age-verification.dto';
import { AgeVerificationEntity } from './entities/age-verification.entity';
import { ReaderEntity } from '../reader/entities/reader.entity';

@Injectable()
export class AgeVerificationService {

  constructor(
    @InjectRepository(AgeVerificationEntity)
    private readonly ageVerificationRepository: Repository<AgeVerificationEntity>,
    private readonly ageVerificationMapper: AgeVerificationMapper,
  ) {} 

  async createAgeVerification(
    readerId: string,
    createAgeVerificationDto: CreateAgeVerificationDto
  ): Promise<ResponseAgeVerificationDto> {
    const hasLegalAge = this.hasLegalAge(createAgeVerificationDto.dateOfBirth);

    const ageVerification = await this.ageVerificationRepository.save({
      readerId,
      hasLegalAge,
      ...createAgeVerificationDto,
    });

    return this.ageVerificationMapper.toModelFromEntity(ageVerification, true);
  }

  async getAgeVerificationByReaderId(reader: ReaderEntity): Promise<ResponseAgeVerificationDto | null> {
    const ageVerification = await this.ageVerificationRepository.findOne({
      where: { reader: { id: reader.id } },
    });

    return ageVerification ? this.ageVerificationMapper.toModelFromEntity(ageVerification, false) : null;
  }

  public hasLegalAge(dateOfBirth: string): boolean {
    const today = new Date();
    const age = today.getFullYear() - new Date(dateOfBirth).getFullYear();
    const monthDifference = today.getMonth() - new Date(dateOfBirth).getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < new Date(dateOfBirth).getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }

}