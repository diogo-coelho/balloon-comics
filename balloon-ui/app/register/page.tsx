"use client";

import { useState } from "react";
import BC_Header from "@/components/ui/BC_Header";
import BC_Toolbar from "@/components/ui/BC_Toolbar";
import BC_Register from "@/components/ui/BC_Register";
import BC_Alert from "@/components/design/BC_Alert";

export default function Register() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  return (
    <>
      <div>
        <BC_Header />
        <section></section>
        <BC_Toolbar />
      </div>

      <BC_Register 
        setAlertActive={setIsActive}
        setAlertMessage={setErrorMessage}
      />
      <BC_Alert
        active={isActive}
        setActive={setIsActive}
        message={errorMessage}
      />
    </>
  );
}