"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, MapPin, Building, FileText } from "lucide-react";
import type { FormularioInscricaoData } from "@/lib/schemas/formulario-inscricao";

export default function EtapaRevisaoDados() {
  const { watch } = useFormContext<FormularioInscricaoData>();
  
  const tipoInscricao = watch("tipoInscricao");
  const votante = watch("votante");
  const endereco = watch("endereco");
  const arquivos = watch("arquivos");

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
      MASCULINO: "Masculino",
      FEMININO: "Feminino",
      OUTRO: "Outro"
    };
    return generos[genero as keyof typeof generos] || genero;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Revisão dos Dados</h3>
        <p className="text-muted-foreground">
          Confira todas as informações antes de prosseguir para as declarações
        </p>
      </div>

      {/* Tipo de Inscrição */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Tipo de Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={tipoInscricao === "MORADOR" ? "default" : "secondary"} className="text-sm">
            {tipoInscricao === "MORADOR" ? "Morador" : "Trabalhador"}
          </Badge>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-sm">{votante?.nome}</p>
            </div>
            {votante?.nomeSocial && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome Social</p>
                <p className="text-sm">{votante.nomeSocial}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p className="text-sm">{votante?.cpf ? formatarCPF(votante.cpf) : ""}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-sm">{votante?.dataNascimento ? formatarDataNascimento(votante.dataNascimento) : ""}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gênero</p>
              <p className="text-sm">{votante?.genero ? formatarGenero(votante.genero) : ""}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-mail</p>
              <p className="text-sm">{votante?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p className="text-sm">{votante?.telefone ? formatarTelefone(votante.telefone) : ""}</p>
            </div>
            {tipoInscricao === "TRABALHADOR" && votante?.empresa && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                <p className="text-sm">{votante.empresa}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
              <p className="text-sm">{endereco?.logradouro}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número</p>
              <p className="text-sm">{endereco?.numero || "S/N"}</p>
            </div>
            {endereco?.complemento && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                <p className="text-sm">{endereco.complemento}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bairro</p>
              <p className="text-sm">{endereco?.bairro}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cidade</p>
              <p className="text-sm">{endereco?.cidade}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <p className="text-sm">{endereco?.estado}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CEP</p>
              <p className="text-sm">{endereco?.cep ? formatarCEP(endereco.cep) : ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Documentos Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {arquivos?.arquivos?.map((arquivo, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{arquivo.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Importante:</strong> Verifique se todas as informações estão corretas. 
          Após prosseguir para as declarações, você não poderá mais alterar estes dados.
        </p>
      </div>
    </div>
  );
}