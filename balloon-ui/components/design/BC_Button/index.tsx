"use client";

import React, { JSX } from "react";
import { ButtonProps } from "./bc_button";
import "./BC_Button.scss";

const BCButton: React.FC<ButtonProps> = (props: ButtonProps): JSX.Element => {
  const className = [
    `button`,
    props.variant ?? `primary`,
    props.size ?? ``,
    props.outline === 'on' ? `outline` : ``
  ].toString().replaceAll(",", " ").trim();
  
  return (
    <button 
      className={className}
      type={props.type || 'button'}
      disabled={props.disabled || false}
      onClick={ (event) => props.handleOnClick?.({ event }) }
    >
      { props.children}
    </button>
  );
};

export default BCButton;