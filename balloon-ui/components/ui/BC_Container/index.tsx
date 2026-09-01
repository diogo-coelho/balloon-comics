import "./BC_Container.scss";
import { ContainerProps } from "./bc_container";

const BCContainer = (props: ContainerProps) => {
  const getClassName = (mainClass: string) => {
    return [
      mainClass,
      props.hasHeader === false ? 'no-header' : '',
    ].toString().replaceAll(',', ' ').trim();
  }

  return (
    <>
      <div className={getClassName("container")}>
        <div className={getClassName("main-container")}>
          {props.children}
        </div>
      </div> 
    </>
  );
}

export default BCContainer;