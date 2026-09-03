export type AgeVerificationData = {
  id: string;
  readerId?: string;
  hasLegalAge: boolean;
  dateOfBirth: string;
  createdAt: Date;
  updatedAt: Date;
}