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