"use client";

import './BC_Input.scss';
import React, { JSX, useEffect, useState } from "react";
import { InputProps } from './bc_input';
import { IconSearch } from '@tabler/icons-react';

const BC_Input: React.FC<InputProps> = (props: InputProps): JSX.Element => {
  const externalValue = props.currentValue ?? props['current-value'];
  const [internalValue, setInternalValue] = useState(externalValue ?? '');

  const className = (mainClass: string): string => {
    return [
      mainClass,
      props.variant ?? '',
      (props.inputSize || props['input-size']) ?? ``,
      props.error ? `error` : ``,
      props.align ? `align-${props.align}` : ``,
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
      <div className={className('input-container')} >
        <input
          className={className('input')}
          type={ props.type || `text` } 
          placeholder={ props.placeholder }
          disabled={ props.disabled || false }
          value={internalValue}
          onChange={ (event) => {
            setInternalValue(event.target.value);
            props.handleOnChange?.({ args: event.target.value, event });
          }}
          onClick={ (event) => props.handleOnClick?.(event)}
        />
        { props.suffix && 
          <div className={`suffix${props.active === 'true' ? ` active` : ''}`}
            onClick={ (event) => props.handleOnClick?.(event)}
          >
            { props.suffixIcon ?? <IconSearch className="icon-search"/> }
          </div>
        }
      </div>
      { props.error && (<span>{ props.error }</span>)}
      { props.helpText && (<span className="help-text">{ props.helpText }</span>)}
    </>
  );
};

export default BC_Input;