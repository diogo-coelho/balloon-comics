import { JSX, DialogHTMLAttributes, MouseEvent, ReactNode } from "react";

type Active = 'on' | 'off'

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  children: ReactNode,
  active: Active,
  setActive: (active: boolean) => void,
  handleOnClose?: (
    data: { 
      args?: T | T[], 
      event: MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent<HTMLButtonElement, KeyboardEvent>
  }) => T,
}