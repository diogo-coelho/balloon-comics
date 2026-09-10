export interface AgeVerificationProps {
  dateOfBirth: string;
  setDateOfBirth: React.Dispatch<React.SetStateAction<string>>;
  errorDateOfBirth: string | undefined;
  onClick: (args: string) => void;
}