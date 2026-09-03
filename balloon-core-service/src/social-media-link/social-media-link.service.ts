import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ReaderEntity } from "../reader/entities/reader.entity";
import { SocialMediaLinkEntity } from "./entities/social-media-link.entity";
import { CreateSocialMediaLinkDto } from "./dtos/request/create-social-media-link.dto";
import { ResponseSocialMediaLinkDto } from "./dtos/response/response-social-media-link.dto";
import { SocialMediaLinkMapper } from "./mappers/social-media-link.mapper";

@Injectable()
export class SocialMediaLinkService {

  constructor(
    @InjectRepository(SocialMediaLinkEntity)
    private readonly socialMediaLinkRepository: Repository<SocialMediaLinkEntity>,
    private readonly socialMediaLinkMapper: SocialMediaLinkMapper,
  ) {}

  async getSocialMediaLinksByReaderId(reader: ReaderEntity): Promise<ResponseSocialMediaLinkDto[]> {
    const socialMediaLinks = await this.socialMediaLinkRepository.find({
      where: { reader: { id: reader.id } },
    });
    return socialMediaLinks.map(link => this.socialMediaLinkMapper.toModelFromEntity(link, false));
  }
  
  async getSocialMediaLinkByReaderIdAndName(reader: ReaderEntity, name: string): Promise<any> {
    const socialMediaLinks = await this.socialMediaLinkRepository.findOne({
      where: { 
        reader: { id: reader.id },
        name: name
      },
    });
    return socialMediaLinks ? this.socialMediaLinkMapper.toModelFromEntity(socialMediaLinks, false) : null;
  }

  async createSocialMediaLink(
    reader: ReaderEntity,
    socialMediaLinkDto: CreateSocialMediaLinkDto
  ): Promise<ResponseSocialMediaLinkDto> {
    const { name, url } = socialMediaLinkDto;

    const socialMediaLink = this.socialMediaLinkRepository.create({
      reader: { id: reader.id },
      name: name as string,
      url,
    });
    const savedSocialMediaLink = await this.socialMediaLinkRepository.save(socialMediaLink);

    return this.socialMediaLinkMapper.toModelFromEntity(savedSocialMediaLink, false);
  }

}