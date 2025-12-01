import { redirect } from 'next/navigation';
import FormularioInscricao from './_components/formulario-inscricao';

export default function Inscrição() {
  const limiteInscricao = new Date("2025-11-30T23:59:59.999Z");
  const agora = new Date();
  if (agora > limiteInscricao) redirect("/");
  return <FormularioInscricao />
}