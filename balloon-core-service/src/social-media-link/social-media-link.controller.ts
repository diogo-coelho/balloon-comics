import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SocialMediaLinkService } from './social-media-link.service';
import { ReaderEntity } from '../reader/entities/reader.entity';
import { ResponseSocialMediaLinkDto } from './dtos/response/response-social-media-link.dto';
import { AuthTokenGuard } from '../auth/guards/auth-token.guard';

@Controller('social-media-links')
export class SocialMediaLinkController {

  constructor(private readonly socialMediaLinkService: SocialMediaLinkService) {}

  @UseGuards(AuthTokenGuard)
  @Get('/reader/:id')
  async getSocialMediaLinksByReaderId(
    @Param('id') readerId: string,
    @Body('name') name: string,
  ): Promise<ResponseSocialMediaLinkDto> {
    return this.socialMediaLinkService.getSocialMediaLinkByReaderIdAndName({ id: readerId } as ReaderEntity, name);
  }

}