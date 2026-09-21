export type AgeVerificationOutput = {
  id: string;
  hasLegalAge: boolean;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateAgeVerificationInput = {
  dateOfBirth: Date;
};
