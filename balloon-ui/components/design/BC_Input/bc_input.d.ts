import { InputHTMLAttributes, MutableRefObject } from "react";
import { IconType } from './ds_icon';

type InputAttributeType =
  "button" |
  "checkbox" |
  "color" |
  "date" |
  "datetime-local" |
  "email" |
  "file" |
  "hidden" |
  "image" |
  "month" |
  "number" |
  "password" |
  "radio" |
  "range" |
  "reset" |
  "search" |
  "submit" |
  "tel" |
  "text" |
  "time" |
  "url" |
  "week";

type InputSize =
  'small' |
  'normal' |
  'medium' |
  'large' |
  'full';

type AlignText = 
  'center' |
  'left' |
  'right';

type Variant = 'secondary';

export enum IconType {
  ARROW_DROP_DOWN = '/arrow_drop_down.png'
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: InputAttributeType,
  align?: AlignText,
  disabled?: boolean,
  placeholder?: string,
  variant?: Variant,
  inputSize?: InputSize,
  "input-size"?: InputSize,
  suffix?: boolean,
  active?: string,
  currentValue?: string,
  "current-value"?: string,
  error?: string,
  helpText?: string | JSX.Element<T>,
  suffixIcon?: JSX.Element,
  handleOnChange?: (
    data: { 
      args?: T | T[], 
      event: ChangeEvent<HTMLInputElement>
  }) => T,
  handleOnClick?: (
    event: MouseEvent<HTMLButtonElement, MouseEvent> 
  ) => T
}