"use client";

import { useState } from "react";
import BC_Register from "@/components/ui/BC_Register";
import BC_Alert from "@/components/design/BC_Alert";

export default function Register() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  return (
    <>
      <BC_Register 
        setAlertActive={setIsActive}
        setAlertMessage={setErrorMessage}
      />
      <BC_Alert
        title="Falha no cadastro"
        variant="error"
        active={isActive}
        setActive={setIsActive}
        message={errorMessage}
      />
    </>
  );
}