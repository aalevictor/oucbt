"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

import { 
  formularioInscricaoSchema, 
  type FormularioInscricaoData,
  etapaSchemas 
} from "@/lib/schemas/formulario-inscricao";

import EtapaTipoInscricao from "./etapas/etapa-tipo-inscricao";
import EtapaDadosVotante from "./etapas/etapa-dados-votante";
import EtapaEndereco from "./etapas/etapa-endereco";
import EtapaArquivo from "./etapas/etapa-arquivo";
import { toast } from "sonner";
import { isWithinOUCBTPerimeter } from "@/lib/utils/polygon-validation";

const etapas = [
  {
    id: 1,
    titulo: "Tipo de Inscrição",
    descricao: "Selecione como você participa",
    component: EtapaTipoInscricao
  },
  {
    id: 2,
    titulo: "Endereço",
    descricao: "Informe seu endereço completo",
    component: EtapaEndereco
  },
  {
    id: 3,
    titulo: "Dados Pessoais",
    descricao: "Informe seus dados pessoais",
    component: EtapaDadosVotante
  },
  {
    id: 4,
    titulo: "Documentos",
    descricao: "Envie os documentos necessários",
    component: EtapaArquivo
  }
];

export default function FormularioInscricao() {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [etapasCompletas, setEtapasCompletas] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<FormularioInscricaoData>({
    resolver: zodResolver(formularioInscricaoSchema),
    mode: "onChange",
    defaultValues: {
      tipoInscricao: undefined as any,
      votante: {
        nome: "",
        email: "",
        cpf: "",
        dataNascimento: "",
        empresa: ""
      },
      endereco: {
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        latitude: null,
        longitude: null
      },
      arquivos: { arquivos: [] }
    }
  });

  const { trigger, getValues, handleSubmit, formState: { errors } } = methods;

  const proximaEtapa = async () => {
    const etapaSchema = etapaSchemas[etapaAtual as keyof typeof etapaSchemas];
    const dadosEtapa = getValues();
    
    let isValid = false;
    
    // Validar dados específicos da etapa atual
    if (etapaAtual === 1) {
      // Etapa 1: Tipo de Inscrição
      isValid = await trigger(["tipoInscricao"]);
    } else if (etapaAtual === 2) {
      // Etapa 2: Endereço
      isValid = await trigger([
        "endereco.logradouro", 
        "endereco.bairro", 
        "endereco.cidade", 
        "endereco.estado", 
        "endereco.cep"
      ]);
      
      // Verificar se o endereço está dentro do perímetro
      if (isValid) {
        const latitude = getValues("endereco.latitude");
        const longitude = getValues("endereco.longitude");
        
        if (!latitude || !longitude) {
          toast.error("Por favor, selecione um local no mapa.");
          isValid = false;
        } else if (!isWithinOUCBTPerimeter(latitude, longitude)) {
          toast.error("O endereço selecionado está fora do perímetro permitido. Por favor, selecione um endereço dentro da área de cobertura.");
          isValid = false;
        }
      }
    } else if (etapaAtual === 3) {
      // Etapa 3: Dados do Votante
      const tipoInscricao = getValues("tipoInscricao");
      if (tipoInscricao === "TRABALHADOR") {
        isValid = await trigger(["votante.nome", "votante.email", "votante.cpf", "votante.dataNascimento", "votante.empresa"]);
      } else {
        isValid = await trigger(["votante.nome", "votante.email", "votante.cpf", "votante.dataNascimento"]);
      }
    } else if (etapaAtual === 4) {
      // Etapa 4: Documentos
      isValid = await trigger(["arquivos"]);
    }

    if (isValid) {
      // Marcar etapa como completa
      if (!etapasCompletas.includes(etapaAtual)) {
        setEtapasCompletas([...etapasCompletas, etapaAtual]);
      }
      
      if (etapaAtual < etapas.length) {
        setEtapaAtual(etapaAtual + 1);
      }
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Criar FormData para envio
      const formData = new FormData();
      
      // Adicionar tipo de inscrição
      formData.append("tipoInscricao", data.tipoInscricao);
      
      // Adicionar dados do votante
      formData.append("votante.nome", data.votante.nome);
      formData.append("votante.email", data.votante.email);
      formData.append("votante.cpf", data.votante.cpf);
      formData.append("votante.dataNascimento", data.votante.dataNascimento);
      if (data.votante.empresa) {
        formData.append("votante.empresa", data.votante.empresa);
      }
      
      // Adicionar dados do endereço
      formData.append("endereco.logradouro", data.endereco.logradouro);
      if (data.endereco.numero) formData.append("endereco.numero", data.endereco.numero);
      if (data.endereco.complemento) formData.append("endereco.complemento", data.endereco.complemento);
      formData.append("endereco.bairro", data.endereco.bairro);
      formData.append("endereco.cidade", data.endereco.cidade);
      formData.append("endereco.estado", data.endereco.estado);
      formData.append("endereco.cep", data.endereco.cep);
      if (data.endereco.latitude) formData.append("endereco.latitude", data.endereco.latitude.toString());
      if (data.endereco.longitude) formData.append("endereco.longitude", data.endereco.longitude.toString());
      
      // Adicionar arquivos
      if (data.arquivos && data.arquivos.arquivos && data.arquivos.arquivos.length > 0) {
        data.arquivos.arquivos.forEach((arquivo: File, index: number) => {
          formData.append(`arquivos[${index}]`, arquivo);
        });
      }

      // Enviar para a API
      const response = await fetch("/api/inscricao", {
        method: "POST",
        body: formData,
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Erro ao enviar formulário");
      }

      toast.success("Inscrição realizada com sucesso! Seus dados foram salvos e estão aguardando aprovação.");
      
      // Resetar formulário após sucesso
      methods.reset();
      setEtapaAtual(1);
      setEtapasCompletas([]);
      
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao realizar inscrição. Tente novamente.";
      toast.error(mensagem);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progresso = (etapaAtual / etapas.length) * 100;
  const EtapaComponent = etapas[etapaAtual - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6">
      <Card className="border-0 shadow-none md:border-1 md:shadow">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Formulário para inscrição de eleitores
          </CardTitle>
          <CardDescription className="text-center">
            Preencha todas as etapas para completar sua inscrição
          </CardDescription>
          <div className="space-y-2">
            <Progress value={progresso} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Etapa {etapaAtual} de {etapas.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold">
                  {etapas[etapaAtual - 1].titulo}
                </h3>
                <p className="text-muted-foreground">
                  {etapas[etapaAtual - 1].descricao}
                </p>
              </div>
              <EtapaComponent />
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={etapaAnterior}
                  disabled={etapaAtual === 1}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
                {etapaAtual < etapas.length ? (
                  <Button
                    type="button"
                    onClick={proximaEtapa}
                    className="flex items-center space-x-2"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || etapasCompletas.length < etapas.length - 1}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Finalizar Inscrição</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}