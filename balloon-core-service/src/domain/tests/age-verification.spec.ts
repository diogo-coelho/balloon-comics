import { AgeVerification } from "../age-verification/entities/age-verification";

describe("AgeVerification", () => {
  it("deve criar a verificação com maioridade calculada corretamente", () => {
    const dateOfBirth = new Date("2000-05-10T00:00:00.000Z");
    const referenceDate = new Date("2026-09-17T00:00:00.000Z");

    const ageVerification = AgeVerification.create({
      readerId: "reader-id",
      dateOfBirth,
      referenceDate,
    });

    expect(ageVerification.readerId).toBe("reader-id");
    expect(ageVerification.hasLegalAge).toBe(true);
    expect(ageVerification.createdAt).toEqual(referenceDate);
    expect(ageVerification.updatedAt).toEqual(referenceDate);
  });

  it("deve calcular maioridade como falsa antes do aniversário", () => {
    const dateOfBirth = new Date("2008-12-31T00:00:00.000Z");
    const referenceDate = new Date("2026-09-17T00:00:00.000Z");

    expect(AgeVerification.calculateLegalAge(dateOfBirth, referenceDate)).toBe(false);
  });

  it("deve atualizar a data de nascimento e recalcular a maioridade", () => {
    const ageVerification = new AgeVerification(
      "age-id",
      "reader-id",
      new Date("2000-01-01T00:00:00.000Z"),
      true,
      new Date("2025-01-01T00:00:00.000Z"),
      new Date("2025-01-01T00:00:00.000Z"),
    );

    ageVerification.updateDateOfBirth(new Date("2010-01-01T00:00:00.000Z"), new Date("2026-09-17T00:00:00.000Z"));

    expect(ageVerification.dateOfBirth).toEqual(new Date("2010-01-01T00:00:00.000Z"));
    expect(ageVerification.hasLegalAge).toBe(false);
    expect(ageVerification.updatedAt.getTime()).toBeGreaterThan(new Date("2025-01-01T00:00:00.000Z").getTime());
  });
});
