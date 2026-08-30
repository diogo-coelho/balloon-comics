import { ReactNode, ButtonHTMLAttributes } from "react"

type Variant = 
  'primary' |
  'secondary' |
  'success' |
  'warning' |
  'danger' |
  'black' | 
  'transparent';

type Size = 
  'small' |
  'medium' |
  'large';

type Outline = 'on' | 'off'

type ButtonTypeAttribute = 
  'reset' |
  'button' |
  'submit';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode,
  variant?: Variant,
  size?: Size,
  type?: ButtonTypeAttribute,
  disabled?: boolean,
  outline?: Outline,
  transparent?: Outline,
  handleOnClick?: (
    data: { 
      args?: T | T[], 
      event: MouseEvent<HTMLButtonElement, MouseEvent> 
  }) => T,
}