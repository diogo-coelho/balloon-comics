import "./BC_Reader.scss";
import { ReaderProps } from "./bc-reader";
import BC_Input from "@/components/design/BC_Input";
import BC_Textarea from "@/components/design/BC_Textarea";
import BC_Button from "@/components/design/BC_Button";

const BC_Reader = ({ isLoading, readerData }: ReaderProps) => {
  return (
    <>
    { !isLoading && (
      <div className="reader-container">
        <div className="reader-card">
          <div className="reader-section">
            <h1>Complete seu perfil</h1>
            <p>E melhore ainda mais a sua experiência na plataforma Balloon Comics.</p>
          </div>

          <div className="wrapper">
            <section className="reader-section">          
              <div className="reader-segment">
                <h3>Dados básicos</h3>

                <div className="input-segment">
                  <div className="input-area">
                    <div className="input-group">
                      <label htmlFor="username">Username</label>
                      <BC_Input 
                        id="username" 
                        name="username" 
                        type="text"
                        currentValue={readerData?.username as string} 
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
                        currentValue={readerData?.email as string} 
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

            <form className="reader-section">
              <div className="reader-segment">
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
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </> 
  );
};

export default BC_Reader;