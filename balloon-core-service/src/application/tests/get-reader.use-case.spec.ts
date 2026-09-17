import { GetReaderUseCase } from "../reader/use-cases/get-reader.use-case";
import ReaderNotFoundError from "../../domain/reader/errors/reader-not-found.error";
import { Reader } from "../../domain/reader/entities/reader";
import { SocialMediaTypeEnum } from "../../domain/social-media-link/enums/social-media-type.enum";

describe("GetReaderUseCase", () => {
  it("deve buscar o leitor com dados de verificação de idade e links sociais", async () => {
    const reader = new Reader(
      "reader-id",
      "user-id",
      "ana@example.com",
      "ana",
      "Ana",
      "readers/avatar.png",
      "Bio da ana",
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-01T00:00:00.000Z"),
    );

    const readers = { findByUserId: jest.fn().mockResolvedValue(reader) };
    const ageVerification = { findByReaderId: jest.fn().mockResolvedValue({
      id: "age-id",
      hasLegalAge: true,
      dateOfBirth: new Date("2000-05-10T00:00:00.000Z"),
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    }) };
    const socialMediaLinks = { findByReaderId: jest.fn().mockResolvedValue([{
      id: "link-id",
      name: SocialMediaTypeEnum.INSTAGRAM,
      url: "https://instagram.com/ana",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    }]) };
    const storage = { getPublicUrl: jest.fn().mockReturnValue("https://cdn.example.com/readers/avatar.png") };

    const result = await new GetReaderUseCase(
      readers as any,
      ageVerification as any,
      socialMediaLinks as any,
      storage as any,
    ).execute("user-id");

    expect(result.id).toBe("reader-id");
    expect(result.imageUrl).toBe("https://cdn.example.com/readers/avatar.png");
    expect(result.ageVerification?.hasLegalAge).toBe(true);
    expect(result.socialMediaLinks).toHaveLength(1);
    expect(storage.getPublicUrl).toHaveBeenCalledWith("readers/avatar.png");
  });

  it("deve rejeitar quando o leitor não existe", async () => {
    const readers = { findByUserId: jest.fn().mockResolvedValue(null) };

    await expect(
      new GetReaderUseCase(
        readers as any,
        { findByReaderId: jest.fn() } as any,
        { findByReaderId: jest.fn() } as any,
        { getPublicUrl: jest.fn() } as any,
      ).execute("missing-user"),
    ).rejects.toBeInstanceOf(ReaderNotFoundError);
  });
});
