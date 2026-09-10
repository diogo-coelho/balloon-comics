export interface CreateReaderProps {
  isLoading: boolean;
  readerData: ReaderData;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  biography: string;
  setBiography: React.Dispatch<React.SetStateAction<string>>;
  errorFullName: string | undefined;
  errorBiography: string | undefined;
  onClick: (args: string) => void;
}