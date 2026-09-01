"use client";

import "./BC_Spinning.scss";
import type { CSSProperties } from "react";
import { SpinningProps } from "./bc_spinning";

const BCSpinning = (props: SpinningProps) => {
  return (
    <div className="spinning-container">
      <div 
        className="spinner"
        style={{
          width: props.width ?? "24px",
          height: props.height ?? "24px",
          "--border-width": props.borderWidth ?? "5px"
        } as CSSProperties & { "--border-width": string | number }}
      
      ></div>
    </div>
  );
};

export default BCSpinning;