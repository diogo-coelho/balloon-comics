import { SocialMediaLink } from "../../domain/social-media-link/entities/social-media-link";
import { SocialMediaTypeEnum } from "../../domain/social-media-link/enums/social-media-type.enum";
import { TypeOrmSocialMediaLinkRepository } from "../persistence/typeorm/repositories/typeorm-social-media-link.repository";

describe("TypeOrmSocialMediaLinkRepository", () => {
  it("deve buscar e salvar links sociais para o leitor", async () => {
    const link = SocialMediaLink.create({
      readerId: "reader-id",
      name: SocialMediaTypeEnum.INSTAGRAM,
      url: "https://instagram.com/ana",
    });

    const repository = {
      findBy: jest.fn().mockResolvedValue([
        {
          id: link.id,
          reader: { id: "reader-id" },
          name: link.name,
          url: link.url,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        },
      ]),
      findOneBy: jest.fn().mockResolvedValue({
        id: link.id,
        reader: { id: "reader-id" },
        name: link.name,
        url: link.url,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const adapter = new TypeOrmSocialMediaLinkRepository(repository as any);

    const foundAll = await adapter.findByReaderId("reader-id");
    const foundOne = await adapter.findByReaderIdAndName("reader-id", SocialMediaTypeEnum.INSTAGRAM);
    const saved = await adapter.saveMany([link]);

    expect(foundAll).toHaveLength(1);
    expect(foundOne).toBeInstanceOf(SocialMediaLink);
    expect(saved).toHaveLength(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
