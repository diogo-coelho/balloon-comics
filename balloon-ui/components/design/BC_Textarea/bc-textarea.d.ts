import { TextareaHTMLAttributes } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  type?: InputAttributeType,
  align?: AlignText,
  disabled?: boolean,
  placeholder?: string,
  variant?: Variant,
  textAreaSize?: InputSize,
  "textarea-size"?: InputSize,
  active?: string,
  currentValue?: string,
  "current-value"?: string,
  error?: string,
  helpText?: string | JSX.Element<T>,
  handleOnChange?: (
    data: { 
      args?: T | T[], 
      event: ChangeEvent<HTMLInputElement>
  }) => T,
  handleOnClick?: (
    event: MouseEvent<HTMLButtonElement, MouseEvent> 
  ) => T
}