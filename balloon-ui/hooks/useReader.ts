import { isEmpty, hasValidUrlFormat, hasDateOfBirthValidFormat } from "@/shared/utils/StringUtils";
import { useState } from "react";

const useReader = (fields: string[]) => {
  const [fullName, setFullName] = useState("");
  const [biography, setBiography] = useState("");
  const [links, setLinks] = useState<{ name: string, label: string, url: string }[]>([]);
  const [dateOfBirth, setDateOfBirth] = useState<string>("");

  const [errorFullName, setErrorFullName] = useState<string | undefined>(undefined);
  const [errorBiography, setErrorBiography] = useState<string | undefined>(undefined);
  const [errorLinks, setErrorLinks] = useState<string | undefined>(undefined);
  const [errorDateOfBirth, setErrorDateOfBirth] = useState<string | undefined>(undefined);

  const isFullNameValid = (): boolean => {
    console.log('fullName', fullName)
    console.log('isEmpty(fullName)', isEmpty(fullName))
    if (!fullName || isEmpty(fullName)) {
      setErrorFullName("Dado incorreto. Revise e digite novamente.")
      return false;
    }
  
    return true;
  }

  const isBiographyValid = (): boolean => {
    if (!!biography && isEmpty(biography.trim())) {
      setErrorBiography("Dado incorreto. Revise e digite novamente.")
      return false;
    }
  
    return true;
  }

  const isLinksValid = (): boolean => {
    if (links.length > 0 && 
        links.some(link => 
          isEmpty(link.name) || 
          isEmpty(link.url)
        )) {
      setErrorLinks("Dado incorreto. Revise e digite novamente.")
      return false;
    }

    if (links.length > 0 && 
        links.some(link => !hasValidUrlFormat(link.url)
      )) {
      setErrorLinks("A url informada é inválida. Revise e digite novamente.")
      return false;
    }
  
    return true;
  }

  const isDateOfBirthValid = (): boolean => {
    if (dateOfBirth && isEmpty(dateOfBirth.trim())) {
      setErrorDateOfBirth("Dado incorreto. Revise e digite novamente.")
      return false;
    }

    if (dateOfBirth && hasDateOfBirthValidFormat(dateOfBirth) === false) {
      setErrorDateOfBirth("A data de nascimento informada é inválida. Revise e digite novamente.")
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

  return {
    fullName,
    biography,
    links,
    dateOfBirth,
    errorFullName,
    errorBiography,
    errorLinks,
    errorDateOfBirth,
    setFullName,
    setBiography,
    setLinks,
    setDateOfBirth,
    validateRequiredFields,
  };
};

export default useReader;