"use client";

import "./BC_Login.scss";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import BC_Button from "@/components/design/BC_Button";
import BC_Input from "@/components/design/BC_Input";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useLogin } from "@/hooks/queries/useAuth";
import BC_Spinning from "@/components/design/BC_Spinning";

const BCLogin = () => {
  const router = useRouter();
  const mutation = useLogin();
  const { isPending } = mutation;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    email,
    password,
    errorEmail,
    errorPassword,
    onClick,
    validateRequiredFields,
    getEmailValue,
    getPasswordValue,
  } = useFieldValidation(["email", "password"]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();    

    if (!validateRequiredFields()) return;

    try {
      await mutation.mutateAsync({
        email: email as string,
        password: password as string,
      });
      router.push("/reader");
    } catch (error: Error | unknown) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <h1>Entrar</h1>

          <form onSubmit={(e) => onSubmit(e)}>
            <div className="input-area">
              <div className="input-group">
                <label>E-mail<span>*</span></label>
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
                <span></span>
              </div>

              <div className="input-group">
                <label>Senha<span>*</span></label>
                <BC_Input 
                  id="password" 
                  name="password" 
                  type={isPasswordVisible ? "text" : "password"} 
                  placeholder="Insira sua senha"
                  autoComplete="off" 
                  error={errorPassword}
                  suffix={true}
                  suffixIcon={
                    isPasswordVisible ?
                    <IconEye className="icon" onClick={() => setIsPasswordVisible(false)} /> : 
                    <IconEyeOff className="icon" onClick={() => setIsPasswordVisible(true)} /> 
                  }
                  handleOnChange={(event) => getPasswordValue?.(event.args)}
                  handleOnClick={() => onClick("password")} 
                />
                <span></span>
              </div>
            </div>   

            <BC_Button 
              type="submit" 
              variant="primary" 
              size="small"
              handleOnClick={(e) => onSubmit(e.event)}
            >
                { isPending && 
                  <BC_Spinning width="14px" height="14px" borderWidth="2px" />
                }
                Entrar
            </BC_Button>
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