"use client";

import "./BC_Alert.scss";
import { JSX } from "react/jsx-runtime";
import { IconX, IconAlertCircle } from "@tabler/icons-react";
import { AlertProps } from "./bc-alert";
import BC_Button from "../BC_Button";

const BCAlert = (props: AlertProps): JSX.Element => {
  const className = (mainClass: string): string => {
    return [
      mainClass,
      props.variant ?? '',
      props.active ? 'active' : '',
    ].toString().replaceAll(",", " ").replace(/\s+/g, " ").trim();
  }

  const icons = {
    success: IconAlertCircle,
    error: IconAlertCircle,
    warning: IconAlertCircle,
    info: IconAlertCircle,
  };
  const icon = props.variant ?? 'info';
  const IconComponent = icons[icon];

  return (
    <div className={className('alert-container')}>
      <div className={className('alert-content')}>
        <IconComponent width={24} height={24} stroke={2} color={`var(--bc-color-${icon}-500)`}/>

        <div className={className('alert')}>
          {props.title && <h3>{props.title}</h3>}
          {props.message && <p>{props.message}</p>}
        </div>

        <BC_Button
          variant="transparent"
          className="btn-absolute"
          handleOnClick={(event) => props.setActive(!props.active)}
        >
          <IconX width={20} height={20} stroke={2} />
        </BC_Button>
      </div>      
    </div>
  );
};

export default BCAlert;