export const formatNumberToMonetaryValueString = (number: number): string => {
  const integer = number | 0;
  return `R$ ${ integer.toString() },00`;
}

export const isEmpty = (value: string): boolean => {
  return value.trim().length === 0;
}

export const isEmail = (value: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}

export const hasPasswordValidFormat = (value: string): boolean => {
  if (!value) return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;
  return regex.test(value);
}

export const hasValidUserNameFormat = (value: string): boolean => {
  if (!value) return false;
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(value);
}

export const hasValidUrlFormat = (value: string): boolean => {
  if (!value) return false;
  const regex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return regex.test(value);
}

export const hasDateOfBirthValidFormat = (value: string): boolean => {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);

  if (date.getTime() > today.getTime()) {
    return false;
  }
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(value);
}