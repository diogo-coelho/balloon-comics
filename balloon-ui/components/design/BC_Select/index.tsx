import "./BC_Select.scss";
import React, { JSX, useEffect, useState } from "react";
import { SelectProps } from "./bc-select";
import { IconCaretDownFilled } from '@tabler/icons-react';

const BCSelect: React.FC<SelectProps> = (props: SelectProps): JSX.Element => {
  const externalValue = props.selected?.value;
  const [internalValue, setInternalValue] = useState(externalValue ?? '');

  const className = (mainClass: string): string => {
    return [
      mainClass,
      props.disabled ? `disabled` : ``,
    ].toString().replaceAll(",", " ").replace(/\s+/g, " ").trim();
  }

  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  return (
    <>
      <div className={className('select-container')} >
        <select className={className('select')}
          name={props.name}
          multiple={props.multiple}
          required={props.required}
          disabled={props.disabled}
          value={internalValue}
          onChange={ (event) => {
            setInternalValue(event.target.value);
            props.handleOnChange?.({ args: event.target.value, event });
          }}
          onClick={ (event) => props.handleOnClick?.(event)}
        >
          {props.options.map((option) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-icon">
          <IconCaretDownFilled width={16} height={16} />
        </span>
      </div>
    </>
  )
}

export default BCSelect;