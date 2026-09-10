"use client";

import { useState } from "react";
import BC_LoginForm from "@/components/ui/BC_LoginForm";
import BC_Alert from "@/components/design/BC_Alert";

export default function Login() {  
  const [active, setActive] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  return (
    <>
      <BC_LoginForm 
        setAlertActive={setActive}
        setAlertMessage={setAlertMessage}
      />
      
      <BC_Alert
        title="Falha de autenticação"
        message={alertMessage}
        variant="error"
        active={active}
        setActive={setActive}
      />
    </>
  );
}