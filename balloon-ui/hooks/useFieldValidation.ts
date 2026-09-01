import { useState } from "react";
import { isEmail, isEmpty, hasPasswordValidFormat, hasValidUserNameFormat } from "@/shared/utils/StringUtils";

const useFieldValidation = (fields: string[]) => { 
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>(undefined);
  
  const [errorUserName, setErrorUserName] = useState<string | undefined>(undefined);
  const [errorEmail, setErrorEmail] = useState<string | undefined>(undefined);
  const [errorPassword, setErrorPassword] = useState<string | undefined>(undefined);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<string | undefined>(undefined);
  
  const getUserNameValue = (args: string): void => setUserName(args);
  const getEmailValue = (args: string): void => setEmail(args);
  const getPasswordValue = (args: string): void => setPassword(args);
  const getConfirmPasswordValue = (args: string): void => setConfirmPassword(args);

  const isUserNameValid = (): boolean => {
    if (!userName || isEmpty(userName)) {
      setErrorUserName("Dado incorreto. Revise e digite novamente.")
      return false;
    }

    if (!!userName && !hasValidUserNameFormat(userName)) {
      setErrorUserName("O usuário deve ter entre 3 e 20 caracteres e pode conter apenas letras, números e underscores.")
      return false;
    }

    return true;
  }

  const isEmailValid = (): boolean => {
    if (!email || isEmpty(email)) {
      setErrorEmail("Este campo não pode estar vazio.")
      return false;
    }

    if (!!email && !isEmail(email)) {
      setErrorEmail("E-mail está em formato incorreto")
      return false;
    }

    return true;
  }

  const isPasswordValid = (): boolean => {
    if (!!password && isEmpty(password)) {
      setErrorPassword("Dado incorreto. Revise e digite novamente.")
      return false;
    }

    if (!hasPasswordValidFormat(password as string)) {
      setErrorPassword("A senha deve ter pelo menos 8 caracteres, incluindo pelo menos 1 letra minúscula, 1 letra maiúscula, 1 número e 1 caracter especial");
      return false;
    }

    return true;
  }

  const isConfirmPasswordValid = (): boolean => {
    if (password !== confirmPassword) {
      setErrorPassword("As senhas não coincidem. Revise e digite novamente.")
      setErrorConfirmPassword("As senhas não coincidem. Revise e digite novamente.")
      return false;
    }
    return true;
  }

  const validateRequiredFields = (): boolean => {
    const promises: number[] = [];
    fields.forEach((field) => {
      promises.push((eval(`is${field.charAt(0).toUpperCase() + field.slice(1)}Valid`) as Function)());
    });

    const errors = promises.reduce((acc, curr) => acc + (curr ? 0 : 1), 0);
    return errors === 0;
  }

  const onClick = (value: string) => {
    switch(value) {
      case "username":
        setErrorUserName(undefined);
        break;
      case "email":
        setErrorEmail(undefined);
        break;
      case "password":
        setErrorPassword(undefined);
        break;
      case "confirmPassword":
        setErrorConfirmPassword(undefined);
        break;
      default:
        setErrorUserName(undefined);
        setErrorEmail(undefined);
        setErrorPassword(undefined);
        setErrorConfirmPassword(undefined);
        break;
    }
  }

  return {
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
  }
}

export default useFieldValidation;