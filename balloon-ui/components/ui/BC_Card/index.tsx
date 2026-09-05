import "./BC_Card.scss";
import { CardProps } from "./bc-card";

const BCCard = (props: CardProps) => {
  const className = (mainClass: string): string => [
    mainClass,
    props.flexDirection === 'row' ? `row` : ``,
    props.flexDirection === 'col' ? `col` : ``
  ].toString().replaceAll(",", " ").replace(/\s+/g, " ").trim();

  return (
    <div className={className('card')}>
      <div className="card-title">
        <h1>{props.title}</h1>
        {props.subtitle && <p>{props.subtitle}</p>}
      </div>

      <div className={className('wrapper')}>
        {props.children}
      </div>
    </div>
  )
}

export default BCCard;