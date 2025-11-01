"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertTriangle, ExternalLink } from "lucide-react";
import type { FormularioInscricaoData } from "@/lib/schemas/formulario-inscricao";

export default function EtapaDeclaracoes() {
  const { watch, setValue, formState: { errors } } = useFormContext<FormularioInscricaoData>();
  
  const tipoInscricao = watch("tipoInscricao");
  const votante = watch("votante");
  const endereco = watch("endereco");
  const declaracoes = watch("declaracoes");

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (telefone: string) => {
    return telefone;
  };

  const formatarCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const formatarDataNascimento = (data: string) => {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString("pt-BR");
  };

  const formatarGenero = (genero: string) => {
    const generos = {
      MASCULINO: "masculino",
      FEMININO: "feminino", 
      OUTRO: "outro"
    };
    return generos[genero as keyof typeof generos] || genero;
  };

  const handleDeclaracaoChange = (key: keyof typeof declaracoes, value: boolean) => {
    setValue(`declaracoes.${key}`, value);
  };

  const todasDeclaracoesAceitas = declaracoes && Object.values(declaracoes).every(Boolean);

  // Construir a declaração de identidade dinamicamente como JSX
  const construirDeclaracaoIdentidade = () => {
    const nomeParticipante = votante?.nome || "[nome do participante]";
    const cpfFormatado = votante?.cpf ? formatarCPF(votante.cpf) : "[cpf formatado]";
    const dataNascimentoFormatada = votante?.dataNascimento ? formatarDataNascimento(votante.dataNascimento) : "[data de nascimento formatada]";
    const genero = votante?.genero ? formatarGenero(votante.genero) : "[gênero]";
    const email = votante?.email || "[email]";
    const telefoneFormatado = votante?.telefone ? formatarTelefone(votante.telefone) : "[telefone formatado]";
    
    let localDeclaracao = "";
    if (tipoInscricao === "TRABALHADOR") {
      const nomeEmpresa = votante?.empresa || "[nome da empresa]";
      const logradouro = endereco?.logradouro || "[logradouro]";
      const numero = endereco?.numero || "[numero]";
      const cep = endereco?.cep ? formatarCEP(endereco.cep) : "[cep]";
      localDeclaracao = `trabalho na empresa ${nomeEmpresa}, situada na ${logradouro}, numero ${numero}, CEP ${cep}`;
    } else {
      const logradouro = endereco?.logradouro || "[logradouro]";
      const numero = endereco?.numero || "[numero]";
      const cep = endereco?.cep ? formatarCEP(endereco.cep) : "[cep]";
      localDeclaracao = `resido/tenho domicilio na ${logradouro}, numero ${numero}, CEP ${cep}`;
    }

    const solicitacaoNomeSocial = votante?.nomeSocial && votante.nomeSocial.trim() !== "";

    return (
      <>
        Eu, {nomeParticipante}, portador do Cadastro de Pessoas Físicas (CPF) no {cpfFormatado}, nascido em {dataNascimentoFormatada}, gênero {genero}, e-mail {email}, telefone {telefoneFormatado}. DECLARO, para fins de votação na eleição que tem por finalidade a escolha dos representantes de moradores e trabalhadores do Grupo de Gestão da OUCBT, nos termos do{" "}
        <a 
          href="https://legislacao.prefeitura.sp.gov.br/leis/decreto-63840-de-29-de-outubro-de-2024" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
        >
          Decreto no 63.840/2024
          <ExternalLink className="w-3 h-3" />
        </a>
        , que {localDeclaracao} local este inserido no perímetro de adesão da Operação Urbana Consorciada Bairros do Tamanduateí - OUCBT, conforme descrito no §1º do Art.2º deste Edital e no Mapa 2 da{" "}
        <a 
          href="https://legislacao.prefeitura.sp.gov.br/leis/lei-18079-de-11-de-janeiro-de-2024" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
        >
          Lei 18.079/2024
          <ExternalLink className="w-3 h-3" />
        </a>
        .
        {solicitacaoNomeSocial && (
          <>
            {" "}SOLICITO, conforme{" "}
            <a 
              href="https://legislacao.prefeitura.sp.gov.br/leis/decreto-51180-de-14-de-janeiro-de-2010/consolidado" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
            >
              Decreto n°51.180/2010
              <ExternalLink className="w-3 h-3" />
            </a>
            , a inclusão e uso do meu nome social {votante?.nomeSocial} nos documentos relativos ao Processo Eleitoral do Grupo de Gestão da Operação Urbana Consorciada Bairros do Tamanduateí.
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Todas as declarações são obrigatórias e devem ser aceitas para prosseguir com a inscrição.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Declaração de Identidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaração de Identidade e Participação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-md">
              {construirDeclaracaoIdentidade()}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="declaracao-identidade"
                checked={declaracoes?.declaracaoIdentidade || false}
                onCheckedChange={(checked) => handleDeclaracaoChange('declaracaoIdentidade', checked)}
              />
              <Label htmlFor="declaracao-identidade" className="text-sm font-medium">
                Li e concordo com esta declaração
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Declaração sobre Votação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaração sobre Processo de Votação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-md">
              DECLARO estar ciente que cada eleitor poderá votar em 1(um) representante de trabalhadores de empresas compreendidas no Perímetro de Adesão da OUCBT e em 1(um) representante de moradores do âmbito do Perímetro de Adesão da OUCBT.
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="declaracao-votacao"
                checked={declaracoes?.declaracaoVotacao || false}
                onCheckedChange={(checked) => handleDeclaracaoChange('declaracaoVotacao', checked)}
              />
              <Label htmlFor="declaracao-votacao" className="text-sm font-medium">
                Li e concordo com esta declaração
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Declaração sobre Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaração sobre Apresentação de Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-md">
              DECLARO estar ciente que votarei mediante a apresentação de documento oficial de identificação original com foto.
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="declaracao-documento"
                checked={declaracoes?.declaracaoDocumento || false}
                onCheckedChange={(checked) => handleDeclaracaoChange('declaracaoDocumento', checked)}
              />
              <Label htmlFor="declaracao-documento" className="text-sm font-medium">
                Li e concordo com esta declaração
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Declaração de Autorização */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaração de Autorização de Uso de Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-md">
              DECLARO estar ciente de todos os itens deste edital e concordo em autorizar e ceder, a título gratuito e sem fins lucrativos, o uso de minha imagem em material informativo sobre as Eleições do Grupo de Gestão da Operação Urbana Consorciada Bairros do Tamanduateí.
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="declaracao-autorizacao"
                checked={declaracoes?.declaracaoAutorizacao || false}
                onCheckedChange={(checked) => handleDeclaracaoChange('declaracaoAutorizacao', checked)}
              />
              <Label htmlFor="declaracao-autorizacao" className="text-sm font-medium">
                Li e concordo com esta declaração
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Declaração de Veracidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaração de Veracidade das Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-md">
              DECLARO ainda, sob as penas da lei, em especial aquelas previstas na Lei Federal nº 7.115, de 29 de agosto de 1983, e no artigo 299 do Código Penal (Falsidade Ideológica), que as informações aqui prestadas são verdadeiras.
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="declaracao-veracidade"
                checked={declaracoes?.declaracaoVeracidade || false}
                onCheckedChange={(checked) => handleDeclaracaoChange('declaracaoVeracidade', checked)}
              />
              <Label htmlFor="declaracao-veracidade" className="text-sm font-medium">
                Li e concordo com esta declaração
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {!todasDeclaracoesAceitas && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você deve aceitar todas as declarações para finalizar sua inscrição.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Quase pronto!</strong> Após aceitar todas as declarações, você poderá finalizar sua inscrição.
        </p>
      </div>
    </div>
  );
}