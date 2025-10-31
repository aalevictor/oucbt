import Header from './_components/header';
import FormularioInscricao from './_components/formulario-inscricao';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <FormularioInscricao />
      </main>
    </div>
  );
}