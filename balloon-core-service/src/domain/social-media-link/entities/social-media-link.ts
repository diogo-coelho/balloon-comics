import { randomUUID } from "node:crypto";
import { SocialMediaTypeEnum } from "../enums/social-media-type.enum";

export class SocialMediaLink {

  constructor(
    public readonly id: string,
    public readonly readerId: string,
    public readonly name: SocialMediaTypeEnum,
    public url: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(input: { readerId: string; name: SocialMediaTypeEnum; url: string }): SocialMediaLink {
    const now = new Date();

    return new SocialMediaLink(
      randomUUID(),
      input.readerId,
      input.name,
      input.url,
      now,
      now,
    );
  }

  updateUrl(url: string): void {
    this.url = url;
    this.updatedAt = new Date();
  }

}