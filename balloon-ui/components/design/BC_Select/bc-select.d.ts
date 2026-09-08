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
  currentValue?: string;
  handleOnChange?: (
    data: { 
      args?: string | string[], 
      event: ChangeEvent<HTMLSelectElement>
  }) => void,
  handleOnClick?: (
    event: MouseEvent<HTMLSelectElement, MouseEvent> 
  ) => void
}