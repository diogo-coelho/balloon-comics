import { SelectHTMLAttributes } from "react";

export interface SelectProps  extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  selected?: {
    value: string;
    label: string;
  };
  options: {
    key: string;
    value: string;
    label: string;
  }[];
  handleOnChange?: (
    data: { 
      args?: T | T[], 
      event: ChangeEvent<HTMLInputElement>
  }) => T,
  handleOnClick?: (
    event: MouseEvent<HTMLButtonElement, MouseEvent> 
  ) => T
}