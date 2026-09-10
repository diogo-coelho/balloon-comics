export interface AlertProps {
  title?: string;
  message?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}