import sharp from "sharp";
import { SharpImageProcessorAdapter } from "../media/sharp-image-processor.adapter";
import { UnsupportedImageError } from "../media/errors/unsupported-image.error";

describe("SharpImageProcessorAdapter", () => {
  it("deve processar imagem em formato webp com resize e retorno correto", async () => {
    const adapter = new SharpImageProcessorAdapter();
    const file = {
      originalName: "avatar.png",
      mimeType: "image/png",
      size: 30,
      buffer: await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer(),
    };

    const result = await adapter.process(file, {
      width: 150,
      height: 150,
      quality: 80,
      format: "webp",
      fit: "cover",
    });

    expect(result.originalName).toBe("avatar.webp");
    expect(result.mimeType).toBe("image/webp");
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.size).toBeGreaterThan(0);
  });

  it("deve rejeitar suporte para formato não permitido", async () => {
    const adapter = new SharpImageProcessorAdapter();
    const file = {
      originalName: "avatar.png",
      mimeType: "image/png",
      size: 10,
      buffer: await sharp({
        create: {
          width: 8,
          height: 8,
          channels: 4,
          background: { r: 0, g: 128, b: 255, alpha: 1 },
        },
      })
        .png()
        .toBuffer(),
    };

    await expect(adapter.process(file, { quality: 80, format: "bmp" as any })).rejects.toBeInstanceOf(UnsupportedImageError);
  });
});
