import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Info } from "lucide-react";
import MapaVisualizacao from "./_components/mapa-visualizacao";
import MapaLocalVotacao from "./_components/mapa-local-votacao";

export default function Home() {
  const limiteInscricao = new Date("2025-11-30T23:59:59.999Z");
  const agora = new Date();
  const podeInscrever = agora <= limiteInscricao;
  return (
    <div className="space-y-8">
      {/* Sobre a OUC */}
      <section className="space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold">Sobre a Inscrição para Eleitor (Moradores e trabalhadores)</h2>
          <a href="https://gestaourbana.prefeitura.sp.gov.br/wp-content/uploads/2025/09/Edital_002_2025_SPURB_OUCBT_Trabalhadores_e_251017_092250-1.pdf" target="_blank" className="text-muted-foreground underline">
            Edital Nº 002/2025/SPURB/OUCBT
          </a>
          <Button asChild size="lg" className="text-lg mx-4 px-8 bg-amber-500 hover:bg-amber-600 text-white">
            <Link href="/consulta-cadastro">
              Consultar status de inscrição
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-2 lg:col-span-1 rounded-none md:rounded-md flex justify-between">
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
          <Card className="col-span-2 lg:col-span-1 rounded-none md:rounded-md">
            <CardHeader>
              <CardTitle>Sobre a Eleição</CardTitle>
              <CardDescription>
                14 de dezembro de 2025, domingo, das 8h às 17h, no Descomplica SP - Ipiranga, Rua Breno Ferraz do Amaral, 350, São Paulo/SP, próximo à estação Santos-Imigrantes do Metrô
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapaLocalVotacao className="flex-1 h-full" />
            </CardContent>
          </Card>
          <Card className="rounded-none col-span-2 md:rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                DAS INSCRIÇÕES DOS ELEITORES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-justify text-sm"><strong>Art. 10</strong> - As inscrições dos eleitores deverão ser realizadas no prazo de 01 de novembro de 2025 até as 23h59 do dia 30 de novembro de 2025, exclusivamente, através do endereço eletrônico “OUCBTeleicao2025.prefeitura.sp.gov.br”</p>
              <ul className="space-y-2 text-sm list-disc ml-4 text-justify">
                <li>§1º As inscrições serão aceitas mediante: (i) apresentação dos documentos relacionados neste edital de forma digitalizada; e (ii) a confirmação do atendimento aos requisitos deste edital.</li>
                <li>§2º O tamanho dos arquivos anexos deverá respeitar o limite indicado no endereço eletrônico do caput deste artigo.</li>
                <li>§3º O eleitor deverá consultar, através do número do seu CPF, no endereço eletrônico indicado no caput deste artigo, se sua inscrição foi aceita ou indeferida.</li>
                <li>§4º As dúvidas ou pedidos de esclarecimentos referentes a inscrição deverão ser encaminhadas à Comissão Eleitoral, por e-mail, no seguinte endereço eletrônico: “oucbt@spurbanismo.sp.gov.br”. As respostas aos pedidos de esclarecimentos serão enviadas por e-mail e publicadas em Diário Oficial da Cidade de São Paulo, em até 5 (cinco) dias úteis, contados da data do recebimento da respectiva dúvida pela Comissão Eleitoral.</li>
                <li>§5º Em caso de, eventualmente, surgir qualquer problema tecnológico com o endereço da web descrito no caput deste artigo, a situação será analisada pela Comissão Eleitoral e se for constatado o referido problema, esta divulgará, através de comunicado no Diário Oficial da Cidade de São Paulo, outra forma para a realização das inscrições dos eleitores, podendo vir a ocorrer a prorrogação no prazo de entrega da documentação.</li>
              </ul>
              <p className="text-justify text-sm"><strong>Art. 11</strong> - Ao se inscreverem os eleitores declaram conhecer o Decreto municipal nº 63.840/2024, que regulamenta o processo eleitoral, e estar cientes de todos os itens deste edital, assim como concordam em autorizar e ceder, a título gratuito e sem fins lucrativos, o uso de sua imagem para fins informativos relacionados às Eleições do Grupo de Gestão da Operação Urbana Consorciada Bairros do Tamanduateí.</p>
              <p className="text-justify text-sm"><strong>Art. 12</strong> - Será considerado eleitor o morador residente e/ou domiciliado no Perímetro de Adesão da OUCBT e o trabalhador de empresa instalada no Perímetro de Adesão da OUCBT que se credencie como tal, conforme art.10 deste edital, observadas as regras a seguir: </p>
              <ul className="space-y-2 text-sm list-disc ml-4 text-justify">
                <li>§1º Ser maior de 16 (dezesseis) anos;</li>
                <li>§2º Comprovar a sua residência e/ou seu domicílio com a apresentação de comprovante de residência ou declaração de que reside/possui domicílio no Perímetro de Adesão da OUCBT; ou</li>
                <li>§3º Comprovar sua condição de trabalhador em empresa instalada no Perímetro de Adesão da OUCBT por intermédio da apresentação de Carteira de Trabalho e Previdência Social – CTPS ou contrato de trabalho;</li>
                <li>§4º Só poderá exercer o direito à voto o eleitor que cumprir todos os itens constantes no caput deste artigo.</li>
                <li>§5º Os eleitores votarão mediante a apresentação de documento oficial de identificação original com foto.</li>
              </ul>
              <p className="text-justify text-sm"><strong>Art. 13</strong> - Os documentos listados abaixo deverão ser apresentados digitalmente no momento da inscrição e deverão atender o estabelecido no art. 12 deste edital:</p>
              <ul className="space-y-2 text-sm list-disc ml-4 text-justify">
                <li>I. Cópia simples do documento de identificação oficial com foto, expedido por autoridade nacional ou estrangeira;</li>
                <li>II. Cópia simples do documento de Cadastro de Pessoa Físia - CPF, caso o CPF não conste no documento de identificação oficial com foto;</li>
                <li>III. Apresentação de Carteira de Trabalho e Previdência Social - CTPS ou contrato de trabalho e Anexo III deste edital devidamente preenchido e assinado; ou</li>
                <li>IV. Comprovante de residência, declaração de que reside/possui domicílio no Perímetro de Adesão da OUCBT e Anexo III deste edital devidamente preenchido e assinado.</li>
              </ul>
              <p className="text-justify text-sm"><strong>Parágrafo único:</strong> A critério da Comissão Eleitoral, caso haja necessidade, esta poderá publicar no Diário Oficial da Cidade de São Paulo, até 2 (dois) dias úteis antes da data da eleição, autorização para inscrições de eleitores no dia da eleição.</p>
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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 md:px-0">
          {podeInscrever && (
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/inscricao">
                Iniciar Inscrição
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
          {!podeInscrever && (
            <Button className="text-lg px-8" disabled>
              Inscrição Encerrada
            </Button>
          )}
          
          <Button variant="outline" size="lg" className="text-lg px-8" asChild>
            <Link href="https://gestaourbana.prefeitura.sp.gov.br/estruturacao-territorial/operacoes-urbanas/oucbt/" target="_blank">
              Saiba Mais
              <Info className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
