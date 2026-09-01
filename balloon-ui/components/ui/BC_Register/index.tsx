"use client";

import "./BC_Register.scss";
import useFieldValidation from "@/components/hooks/useFieldValidation";
import BC_Button from "@/components/design/BC_Button";
import BC_Input from "@/components/design/BC_Input";

const BCRegister = () => {

  const {
    userName,
    email,
    password,
    confirmPassword,
    errorUserName,
    errorEmail,
    errorPassword,
    errorConfirmPassword,
    onClick,
    validateRequiredFields,
    getUserNameValue,
    getEmailValue,
    getPasswordValue,
    getConfirmPasswordValue,
  } = useFieldValidation(["userName", "email", "password", "confirmPassword"]);

  

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (validateRequiredFields()) {
      console.log("Form submitted successfully");
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Criar uma conta</h1>

        <form onSubmit={(e) => onSubmit(e)}>
          <p>Preencha os campos abaixo para criar sua conta.</p>

          <div className="input-area">
            <div className="input-group">
              <label htmlFor="username">Nome de usuário<span>*</span></label>
              <BC_Input 
                id="username" 
                name="username" 
                type="text" 
                placeholder="Insira seu nome de usuário"
                autoComplete="off"
                error={errorUserName}
                handleOnChange={(event) => getUserNameValue?.(event.args)}
                handleOnClick={() => onClick("username")}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">E-mail<span>*</span></label>
              <BC_Input 
                id="email" 
                name="email" 
                type="text" 
                placeholder="Insira seu e-mail"
                autoComplete="off"
                error={errorEmail}
                handleOnChange={(event) => getEmailValue?.(event.args)}
                handleOnClick={() => onClick("email")}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha<span>*</span></label>
              <BC_Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Insira sua senha"
                autoComplete="off" 
                error={errorPassword}
                handleOnChange={(event) => getPasswordValue?.(event.args)}
                handleOnClick={() => onClick("password")}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar senha<span>*</span></label>
              <BC_Input 
                id="confirm-password" 
                name="confirm-password" 
                type="password" 
                placeholder="Confirme sua senha"
                autoComplete="off" 
                error={errorConfirmPassword}
                handleOnChange={(event) => getConfirmPasswordValue?.(event.args)}
                handleOnClick={() => onClick("confirmPassword")}
              />
            </div>
          </div>   

          <BC_Button 
            type="submit" 
            variant="primary" 
            size="small"
            handleOnClick={(e) => onSubmit(e.event)}
          >Cadastrar</BC_Button>
        </form>
      </div>
    </div>
  );
}

export default BCRegister;