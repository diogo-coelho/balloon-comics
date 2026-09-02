"use client";

import "./BC_Register.scss";
import { useRouter } from "next/navigation";
import { JSX } from "react/jsx-runtime";
import { useState } from "react";
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import useFieldValidation from "@/hooks/useFieldValidation";
import { useCreatedUser } from "@/hooks/queries/useUser";
import BC_Button from "@/components/design/BC_Button";
import BC_Input from "@/components/design/BC_Input";
import BC_Spinning from "@/components/design/BC_Spinning";

const BCRegister = () => {
  const router = useRouter();
  const mutation = useCreatedUser();
  const { isPending } = mutation;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const {
    userName,
    email,
    password,
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
  
  const helpTextUserName = () : JSX.Element => {
    return (
      <>
        O <strong>nome de usuário</strong> será utilizado como identificador público. <br/>
        Deve possuir apenas <strong>letras, números</strong> e/ou <strong>underscores</strong>.<br/>
        <strong>Exemplo:</strong> johndoe
      </>
    );
  }

  const helpTextPassword = () : JSX.Element => {
    return (
      <>
        A senha deve possuir no mínimo <strong>8 caracteres</strong>.<br/>
        A senha deve ter pelo menos:
        <ul>
          <li><strong>uma letra maiúscula</strong></li>
          <li><strong>uma letra minúscula</strong></li>
          <li><strong>um número</strong></li>
          <li><strong>um símbolo</strong></li>
        </ul>
        <strong>Exemplo:</strong> P@ssw0rd123
      </>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();    
    if (!validateRequiredFields()) return
    try {
      await mutation.mutateAsync({
        username: userName as string,
        email: email as string,
        password: password as string
      });  
      router.push("/reader");
      
    } catch (error: Error | unknown) {
      console.error(error);
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
                helpText={helpTextUserName()}
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
                type={isPasswordVisible ? "text" : "password"} 
                placeholder="Insira sua senha"
                autoComplete="off" 
                error={errorPassword}
                helpText={helpTextPassword()}
                suffix={true}
                suffixIcon={
                  isPasswordVisible ?
                  <IconEye className="icon" onClick={() => setIsPasswordVisible(false)} /> : 
                  <IconEyeOff className="icon" onClick={() => setIsPasswordVisible(true)} /> 
                }
                handleOnChange={(event) => getPasswordValue?.(event.args)}
                handleOnClick={() => onClick("password")}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar senha<span>*</span></label>
              <BC_Input 
                id="confirm-password" 
                name="confirm-password" 
                type={isConfirmPasswordVisible ? "text" : "password"} 
                placeholder="Confirme sua senha"
                autoComplete="off" 
                error={errorConfirmPassword}
                suffix={true}
                suffixIcon={
                  isConfirmPasswordVisible ?
                  <IconEye className="icon" onClick={() => setIsConfirmPasswordVisible(false)} /> : 
                  <IconEyeOff className="icon" onClick={() => setIsConfirmPasswordVisible(true)} /> 
                }
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
          >
            { isPending && 
              <BC_Spinning width="16px" height="16px" borderWidth="2px" />
            }
            Cadastrar
          </BC_Button>
        </form>
      </div>
    </div>
  );
}

export default BCRegister;