"use client";

import "./BC_Login.scss";
import BC_Button from "@/components/design/BC_Button";
import BC_Input from "@/components/design/BC_Input";

const BCLogin = () => {
  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <h1>Entrar</h1>

          <form>
            <div className="input-area">
              <div className="input-group">
                <label>E-mail<span>*</span></label>
                <BC_Input type="text" placeholder="Insira seu e-mail" />
                <span></span>
              </div>

              <div className="input-group">
                <label>Senha<span>*</span></label>
                <BC_Input type="password" placeholder="Insira sua senha" />
                <span></span>
              </div>
            </div>   

            <BC_Button type="submit" variant="primary" size="small">Entrar</BC_Button>
          </form>
        </div>

        <p className="flex justify-center">
          Ainda não possui uma conta? <a href="/register">
          <strong>Cadastre-se</strong></a>
        </p>
      </div>
    </>
  );
}

export default BCLogin;