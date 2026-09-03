import "./BC_Reader.scss";
import BC_Input from "@/components/design/BC_Input";
import { useCurrentReader } from "@/hooks/queries/useReader";

const BC_Reader = () => {
  const { isLoading, isError, data } = useCurrentReader();

  

  return (
    <div className="reader-container">
      <div className="reader-card">
        <h1>Complete seu perfil</h1>

        <form>
          <p></p>

          <div className="input-area">
            <div className="input-group">
              <label htmlFor="name">Nome<span>*</span></label>
              <BC_Input 
                id="name" 
                name="name" 
                type="text" 
                placeholder="Insira seu nome"
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label htmlFor="bio">Biografia</label>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BC_Reader;