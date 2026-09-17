import { Reader } from "../reader/entities/reader";

describe("Reader", () => {
  it("deve criar um leitor com nome inicial igual ao username e datas iniciais", () => {
    const now = new Date("2026-09-17T10:00:00.000Z");
    const reader = new Reader(
      "reader-id",
      "user-id",
      "ana@example.com",
      "ana",
      "ana",
      null,
      null,
      now,
      now,
    );

    expect(reader.id).toBe("reader-id");
    expect(reader.userId).toBe("user-id");
    expect(reader.name).toBe("ana");
    expect(reader.description).toBeNull();
    expect(reader.createdAt).toEqual(now);
    expect(reader.updatedAt).toEqual(now);
  });

  it("deve atualizar perfil quando novos dados forem enviados", () => {
    const initialDate = new Date("2026-09-17T09:00:00.000Z");
    const reader = new Reader(
      "reader-id",
      "user-id",
      "ana@example.com",
      "ana",
      "ana",
      null,
      "Bio antiga",
      initialDate,
      initialDate,
    );

    reader.updateProfile({ name: "Ana Souza", description: "Nova bio" });

    expect(reader.name).toBe("Ana Souza");
    expect(reader.description).toBe("Nova bio");
    expect(reader.updatedAt.getTime()).toBeGreaterThan(initialDate.getTime());
  });

  it("deve manter a descrição atual quando o valor não for enviado", () => {
    const initialDate = new Date("2026-09-17T09:00:00.000Z");
    const reader = new Reader(
      "reader-id",
      "user-id",
      "ana@example.com",
      "ana",
      "Ana",
      null,
      "Bio atual",
      initialDate,
      initialDate,
    );

    reader.updateProfile({ name: "Ana Silva" });

    expect(reader.name).toBe("Ana Silva");
    expect(reader.description).toBe("Bio atual");
  });
});
