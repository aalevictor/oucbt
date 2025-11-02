import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import MapaVisualizacao from "./_components/mapa-visualizacao";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Sobre a OUC */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Sobre a Inscrição para Eleitor</h2>
          <p className="text-muted-foreground">
            Conheça os requisitos e procedimentos para se inscrever como eleitor
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="rounded-none md:rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Art. 10 As inscrições dos eleitores deverão ser realizadas no prazo de 01 de novembro de 2025 até as 23h59 do dia 30 de novembro de 2025, exclusivamente, através do endereço eletrônico “OUCBTeleicao2025.prefeitura.sp.gov.br”
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm list-disc ml-4 text-justify">
                <li>§1º As inscrições serão aceitas mediante: (i) apresentação dos documentos relacionados neste edital de forma digitalizada; e (ii) a confirmação do atendimento aos requisitos deste edital.</li>
                <li>§2º O tamanho dos arquivos anexos deverá respeitar o limite indicado no endereço eletrônico do caput deste artigo.</li>
                <li>§3º O eleitor deverá consultar, através do número do seu CPF, no endereço eletrônico indicado no caput deste artigo, se sua inscrição foi aceita ou indeferida.</li>
                <li>§4º As dúvidas ou pedidos de esclarecimentos referentes a inscrição deverão ser encaminhadas à Comissão Eleitoral, por e-mail, no seguinte endereço eletrônico: “oucbt@spurbanismo.sp.gov.br”. As respostas aos pedidos de esclarecimentos serão enviadas por e-mail e publicadas em Diário Oficial da Cidade de São Paulo, em até 5 (cinco) dias úteis, contados da data do recebimento da respectiva dúvida pela Comissão Eleitoral.</li>
                <li>§5º. Em caso de, eventualmente, surgir qualquer problema tecnológico com o endereço da web descrito no caput deste artigo, a situação será analisada pela Comissão Eleitoral e se for constatado o referido problema, esta divulgará, através de comunicado no Diário Oficial da Cidade de São Paulo, outra forma para a realização das inscrições dos eleitores, podendo vir a ocorrer a prorrogação no prazo de entrega da documentação.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-none md:rounded-md">
            <CardHeader>
              <CardTitle>Área de Abrangência</CardTitle>
              <CardDescription>
                Visualize a região contemplada para habilitação de eleitor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapaVisualizacao className="flex-1 h-full" />
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Pronto para se inscrever?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Faça sua inscrição e participe.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center p-4 md:px-0">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/inscricao">
              Iniciar Inscrição
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="text-lg px-8" asChild>
            <Link href="https://diariooficial.prefeitura.sp.gov.br/md_epubli_visualizar.php?wTTqxIQPF4V7UvwafiQUL-8MEN2OucopCKUELYCc17LhjMxC222qTsFqI5khi35VA7z9-Bj7UzbNF4uSEZhZ-OivZKGhOonipqzqk7-wPWB3eWHBIZSU0HU4yptvQbwm" target="_blank">
              Ver Legislação
              <FileText className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}