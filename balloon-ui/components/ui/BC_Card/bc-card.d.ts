import { ReactNode } from "react";

export interface CardProps {
  title: string,
  subtitle?: string,
  children: ReactNode,
  flexDirection?: 'row' | 'col';
}