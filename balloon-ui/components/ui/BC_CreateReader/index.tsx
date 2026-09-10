import "./BC_CreateReader.scss";
import { CreateReaderProps } from "./bc-create-reader";
import BC_Input from "@/components/design/BC_Input";
import BC_Button from "@/components/design/BC_Button";
import BC_Textarea from "@/components/design/BC_Textarea";

const BCCreateReader = (props: CreateReaderProps) => {
  return (
    <>
    <div className="create-reader-container">
      <section className="create-reader-section">          
        <div className="create-reader-segment">
          <h3>Dados básicos</h3>

          <div className="input-segment">
            <div className="input-area">
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <BC_Input 
                  id="username" 
                  name="username" 
                  type="text"
                  currentValue={props.readerData?.username ?? ""} 
                  disabled
                 />
              </div>
            </div>

            <div className="input-area">
              <div className="input-group">
                <label htmlFor="email">E-mail</label>
                <BC_Input 
                  id="email" 
                  name="email" 
                  type="email"
                  currentValue={props.readerData?.email ?? ""} 
                  disabled
                />
              </div>
            </div>
          </div>
                
          <div className="button-segment">
            <BC_Button
              variant="secondary"
              size="medium"
            >
              Editar dados de acesso
            </BC_Button>
          </div>
        </div>           
      </section>

        <div className="divider"></div>            

        <div className="create-reader-section">
          <div className="create-reader-segment">
            <h3>Informações adicionais</h3>
                    
            <div className="input-segment">
              <div className="input-area">
                <div className="input-group">
                  <label htmlFor="name">Nome Completo <span>*</span></label>
                  <BC_Input 
                    id="name" 
                    name="name" 
                    type="text"
                    placeholder="Insira seu nome completo"
                    currentValue={props.fullName}
                    handleOnChange={(event) => props.setFullName(event.args)}
                    error={props.errorFullName}
                    autoComplete="off"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="bio">Biografia</label>
                  <BC_Textarea 
                    id="bio"
                    name="bio"
                    placeholder="Escreva uma breve biografia sobre você"
                    autoComplete="off"
                    rows={5}
                    currentValue={props.biography}
                    handleOnChange={(event) => props.setBiography(event.args)}
                    error={props.errorBiography}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BCCreateReader;