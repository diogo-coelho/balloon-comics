import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ReaderEntity } from "../reader/entities/reader.entity";
import { SocialMediaLinkEntity } from "./entities/social-media-link.entity";
import { CreateSocialMediaLinkDto } from "./dtos/request/create-social-media-link.dto";
import { Repository } from "typeorm/repository/Repository.js";
import { ResponseSocialMediaLinkDto } from "./dtos/response/response-social-media-link.dto";
import { SocialMediaLinkMapper } from "./mappers/social-media-link.mapper";

@Injectable()
export class SocialMediaLinkService {

  constructor(
    @InjectRepository(SocialMediaLinkEntity)
    private readonly socialMediaLinkRepository: Repository<SocialMediaLinkEntity>,
    private readonly socialMediaLinkMapper: SocialMediaLinkMapper,
  ) {}
  
  async getSocialMediaLinkByReaderIdAndName(reader: ReaderEntity, name: string): Promise<any> {
    const socialMediaLinks = await this.socialMediaLinkRepository.findOne({
      where: { 
        reader: { id: reader.id },
        name: name
      }
    });
    return socialMediaLinks ? this.socialMediaLinkMapper.toModelFromEntity(socialMediaLinks) : null;
  }

  async createSocialMediaLink(
    reader: ReaderEntity,
    socialMediaLinkDto: CreateSocialMediaLinkDto
  ): Promise<ResponseSocialMediaLinkDto> {
    const { name, url } = socialMediaLinkDto;

    const socialMediaLink = this.socialMediaLinkRepository.create({
      reader: { id: reader.id },
      name,
      url,
    });
    const savedSocialMediaLink = await this.socialMediaLinkRepository.save(socialMediaLink);
    return this.socialMediaLinkMapper.toModelFromEntity(savedSocialMediaLink);
  }

}