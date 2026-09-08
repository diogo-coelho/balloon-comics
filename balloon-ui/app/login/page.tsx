import BC_LoginForm from '@/components/ui/BC_LoginForm';
import BC_Header from '@/components/ui/BC_Header';
import BC_Toolbar from '@/components/ui/BC_Toolbar';

export default function Home() {  
  return (
    <>
      <div>
        <BC_Header />
        <section></section>
        <BC_Toolbar />
      </div>

      <BC_LoginForm />
    </>
  );
}