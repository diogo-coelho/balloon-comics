import { randomUUID } from "node:crypto";

export class AgeVerification {

  constructor(
    public readonly id: string,
    public readonly readerId: string,
    public dateOfBirth: Date,
    public hasLegalAge: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(input: {
    readerId: string;
    dateOfBirth: Date;
    referenceDate?: Date;
  }): AgeVerification {
    const now = input.referenceDate ?? new Date();

    return new AgeVerification(
      randomUUID(),
      input.readerId,
      input.dateOfBirth,
      AgeVerification.calculateLegalAge(
        input.dateOfBirth,
        now,
      ),
      now, 
      now,
    )
  }

  updateDateOfBirth(dateOfBirth: Date, referenceDate: Date = new Date()) {
    this.dateOfBirth = dateOfBirth;
    this.hasLegalAge = AgeVerification.calculateLegalAge(dateOfBirth, referenceDate);
  }

  static calculateLegalAge(dateOfBirth: Date, referenceDate: Date = new Date()): boolean {
    let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();

    const monthDifference = referenceDate.getMonth() - dateOfBirth.getMonth();

    if (monthDifference < 0 || (
      monthDifference === 0 && 
      referenceDate.getDate() < dateOfBirth.getDate()
    )) {
      age--;
    }

    return age >= 18;
  }
}