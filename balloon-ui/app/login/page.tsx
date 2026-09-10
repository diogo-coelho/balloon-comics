"use client";

import { useState } from 'react';
import BC_LoginForm from '@/components/ui/BC_LoginForm';
import BC_Header from '@/components/ui/BC_Header';
import BC_Toolbar from '@/components/ui/BC_Toolbar';
import BC_Alert from '@/components/design/BC_Alert';

export default function Home() {  
  const [active, setActive] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  return (
    <>
      <div>
        <BC_Header />
        <section></section>
        <BC_Toolbar />
      </div>

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