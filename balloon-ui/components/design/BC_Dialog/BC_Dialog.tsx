import "./BC_Dialog.scss";
import { JSX, useRef, MouseEvent, KeyboardEvent } from "react";
import { DialogProps } from "./bc-dialog";
import BC_Button from "../BC_Button";
import { IconX } from "@tabler/icons-react";

const BCDialog = (props: DialogProps): JSX.Element => {

  const ref = useRef<HTMLDivElement>(null);

  const getClassName = (mainClass: string): string => {
    return [
      mainClass,
      props.active === 'on' ? `active` : ``
    ].toString().replaceAll(",", " ").trim();
  }

  const closeDialog = (event: MouseEvent | KeyboardEvent): void => {
    props.setActive(false)
    setTimeout(() => props.handleOnClose?.({ event: event as (MouseEvent | KeyboardEvent) }), 300);
  }

  return (
    <>
      <div className={getClassName('dialog')}>
        <div className={getClassName('dialog-container')} ref={ref}>
          { props.children }
          <div className="close-button">
            <BC_Button 
              variant="transparent" 
              handleOnClick={({ event }) => closeDialog(event) }
            >
              <IconX className="icon-close" width={20} height={20} />
            </BC_Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BCDialog;