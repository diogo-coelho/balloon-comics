import "./BC_AgeVerification.scss";
import { JSX } from "react/jsx-runtime";
import { AgeVerificationProps } from "./bc-age-verification";
import BC_Input from "@/components/design/BC_Input";

const BCAgeVerification = (props: AgeVerificationProps): JSX.Element => {

  return (
    <>
      <div className="age-verification-container">
        <section className="age-verification-section">          
          <h3>Verificação de idade</h3>
          <div className="age-verification-segment">
            <p className="paragraph-segment">
              <strong>Atenção:</strong> O preenchimento desse campo é obrigatório para acessar qualquer conteúdo dentro da Balloon Comics marcado com classificação indicativa 18+.
            </p>

            <div className="input-segment">
              <div className="input-area">
                <div className="input-group">
                  <label htmlFor="dateOfBirth">Data de Nascimento</label>
                  <BC_Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date"
                    currentValue={props.dateOfBirth} 
                    handleOnChange={(event) => props.setDateOfBirth(event.args.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default BCAgeVerification;