import "./BC_Textarea.scss";
import { TextAreaProps } from "./bc-textarea";

const BC_Textarea = (props: TextAreaProps) => {
  const className = (mainClass: string): string => {
    return [
      mainClass,
    ].toString().replaceAll(",", " ").replace(/\s+/g, " ").trim();
  }

  return (
    <>
    <div className={className('textarea-container')} >
        <textarea
          className={className('textarea')}
          placeholder={ props.placeholder }
          disabled={ props.disabled || false }
          value={props.currentValue || props['current-value']}
          rows={props.rows || 4}
          onChange={ (event) => props.handleOnChange?.({ args: event.target.value, event }) }
          onClick={ (event) => props.handleOnClick?.(event)}
        />
      </div>
      { props.error && (<span>{ props.error }</span>)}
      { props.helpText && (<span className="help-text">{ props.helpText }</span>)}
    </>
  );
}

export default BC_Textarea;