import { ReaderController } from "../http/reader/reader.controller";

describe("ReaderController", () => {
  it("deve retornar o leitor atual com os dados completos", async () => {
    const getReader = { execute: jest.fn().mockResolvedValue({
      id: "reader-id",
      email: "ana@example.com",
      username: "ana",
      name: "Ana",
      description: "Bio",
      ageVerification: { id: "age-id", hasLegalAge: true, dateOfBirth: new Date("2000-01-01") },
      socialMediaLinks: [{ id: "link-id", name: "Instagram", url: "https://instagram.com/ana" }],
    }) };

    const controller = new ReaderController(getReader as any, {} as any, {} as any);
    const result = await controller.getCurrentReader({ sub: "user-1" } as any);

    expect(getReader.execute).toHaveBeenCalledWith("user-1");
    expect(result).toEqual(expect.objectContaining({
      message: "Leitor encontrado com sucesso",
      data: expect.objectContaining({ id: "reader-id" }),
    }));
  });

  it("deve atualizar o perfil do leitor atual usando o token do usuário", async () => {
    const updateReader = { execute: jest.fn().mockResolvedValue({
      id: "reader-id",
      email: "ana@example.com",
      username: "ana",
      name: "Ana Souza",
      description: "Nova bio",
    }) };

    const controller = new ReaderController({} as any, {} as any, updateReader as any);
    const result = await controller.updateCurrentReader({ sub: "user-1" } as any, {
      name: "Ana Souza",
      description: "Nova bio",
    });

    expect(updateReader.execute).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Ana Souza",
      description: "Nova bio",
    });
    expect(result).toEqual(expect.objectContaining({
      message: "Leitor atualizado com sucesso",
      data: expect.objectContaining({ name: "Ana Souza" }),
    }));
  });

  it("deve enviar a imagem do leitor e retornar a data processada", async () => {
    const uploadReaderImage = { execute: jest.fn().mockResolvedValue({
      id: "reader-id",
      imageUrl: "https://cdn.example.com/readers/avatar.webp",
    }) };

    const controller = new ReaderController({} as any, uploadReaderImage as any, {} as any);
    const result = await controller.uploadImage({ sub: "user-1" } as any, {
      originalname: "avatar.png",
      mimetype: "image/png",
      size: 2048,
      buffer: Buffer.from("fake-image"),
    } as any);

    expect(uploadReaderImage.execute).toHaveBeenCalledWith({
      userId: "user-1",
      file: expect.objectContaining({ originalName: "avatar.png", mimeType: "image/png" }),
    });
    expect(result).toEqual(expect.objectContaining({
      message: "Imagem do leitor atualizada com sucesso",
      data: expect.objectContaining({ imageUrl: "https://cdn.example.com/readers/avatar.webp" }),
    }));
  });
});
