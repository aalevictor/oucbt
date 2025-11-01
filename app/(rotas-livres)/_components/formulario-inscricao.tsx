"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import EtapaRevisaoDados from "./etapas/etapa-revisao-dados";
import EtapaDeclaracoes from "./etapas/etapa-declaracoes";
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
  },
  {
    id: 5,
    titulo: "Revisão de Dados",
    descricao: "Confira todas as informações",
    component: EtapaRevisaoDados
  },
  {
    id: 6,
    titulo: "Declarações",
    descricao: "Aceite as declarações obrigatórias",
    component: EtapaDeclaracoes
  }
];

export default function FormularioInscricao() {
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [etapasCompletas, setEtapasCompletas] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const methods = useForm<FormularioInscricaoData>({
    resolver: zodResolver(formularioInscricaoSchema),
    mode: "onChange",
    defaultValues: {
      tipoInscricao: undefined as any,
      votante: {
        nome: "",
        nomeSocial: "",
        telefone: "",
        genero: undefined as any,
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
      arquivos: { arquivos: [] },
      declaracoes: {
        declaracaoIdentidade: false,
        declaracaoVotacao: false,
        declaracaoDocumento: false,
        declaracaoAutorizacao: false,
        declaracaoVeracidade: false
      }
    }
  });

  const { trigger, getValues, handleSubmit, formState: { errors }, watch } = methods;

  // Função para verificar se pode avançar para a próxima etapa
  const verificarPodeAvancar = () => {
    const dadosEtapa = getValues();
    
    switch (etapaAtual) {
      case 1: // Tipo de Inscrição
        return !!dadosEtapa.tipoInscricao;
      
      case 2: // Endereço
        const endereco = dadosEtapa.endereco;
        return !!(endereco?.logradouro && endereco?.bairro && endereco?.cidade && 
                 endereco?.estado && endereco?.cep && endereco?.latitude && endereco?.longitude);
      
      case 3: // Dados Pessoais
        const votante = dadosEtapa.votante;
        const tipoInscricao = dadosEtapa.tipoInscricao;
        const camposBasicos = !!(votante?.nome && votante?.telefone && votante?.genero && 
                                votante?.email && votante?.cpf && votante?.dataNascimento);
        const empresaOk = tipoInscricao !== "TRABALHADOR" || !!votante?.empresa;
        return camposBasicos && empresaOk;
      
      case 4: // Documentos
        return !!(dadosEtapa.arquivos?.arquivos && dadosEtapa.arquivos.arquivos.length > 0);
      
      case 5: // Revisão de dados
        return true; // Sempre pode avançar da revisão
      
      case 6: // Declarações
        const declaracoes = dadosEtapa.declaracoes;
        return !!(declaracoes?.declaracaoIdentidade && declaracoes?.declaracaoVotacao && 
                 declaracoes?.declaracaoDocumento && declaracoes?.declaracaoAutorizacao && 
                 declaracoes?.declaracaoVeracidade);
      
      default:
        return false;
    }
  };

  // Monitorar mudanças nos dados para atualizar o estado do botão
  useEffect(() => {
    const subscription = watch(() => {
      setPodeAvancar(verificarPodeAvancar());
    });
    
    // Verificar inicialmente
    setPodeAvancar(verificarPodeAvancar());
    
    return () => subscription.unsubscribe();
  }, [etapaAtual, watch]);

  // Atualizar quando a etapa muda
  useEffect(() => {
    setPodeAvancar(verificarPodeAvancar());
  }, [etapaAtual]);

  const proximaEtapa = async () => {
    console.log("🔍 INICIANDO proximaEtapa - Etapa atual:", etapaAtual);
    
    const etapaSchema = etapaSchemas[etapaAtual as keyof typeof etapaSchemas];
    const dadosEtapa = getValues();
    console.log("Dados da etapa:", dadosEtapa);
    
    let isValid = false;
    
    // Validar dados específicos da etapa atual
    if (etapaAtual === 1) {
      // Etapa 1: Tipo de Inscrição
      console.log("📝 Validando etapa 1 - Tipo de Inscrição");
      isValid = await trigger(["tipoInscricao"]);
      console.log("✅ Resultado validação etapa 1:", isValid);
    } else if (etapaAtual === 2) {
      // Etapa 2: Endereço
      console.log("🏠 Validando etapa 2 - Endereço");
      isValid = await trigger([
        "endereco.logradouro", 
        "endereco.bairro", 
        "endereco.cidade", 
        "endereco.estado", 
        "endereco.cep"
      ]);
      console.log("📍 Resultado validação campos endereço:", isValid);
      
      // Verificar se o endereço está dentro do perímetro
      if (isValid) {
        const latitude = getValues("endereco.latitude");
        const longitude = getValues("endereco.longitude");
        console.log("🌍 Coordenadas:", { latitude, longitude });
        
        if (!latitude || !longitude) {
          console.log("❌ Coordenadas não encontradas");
          toast.error("Por favor, selecione um local no mapa.");
          isValid = false;
        } else {
          console.log("🔍 Verificando perímetro...");
          const dentroPerimetro = await isWithinOUCBTPerimeter(latitude, longitude);
          console.log("🎯 Dentro do perímetro:", dentroPerimetro);
          if (!dentroPerimetro) {
            toast.error("O endereço selecionado está fora do perímetro permitido. Por favor, selecione um endereço dentro da área de cobertura.");
            isValid = false;
          }
        }
      }
      console.log("✅ Resultado final etapa 2:", isValid);
    } else if (etapaAtual === 3) {
      // Etapa 3: Dados do Votante
      console.log("👤 Validando etapa 3 - Dados do Votante");
      const tipoInscricao = getValues("tipoInscricao");
      console.log("📋 Tipo de inscrição:", tipoInscricao);
      
      const camposObrigatorios = [
        "votante.nome",
        "votante.telefone",
        "votante.genero",
        "votante.email",
        "votante.cpf",
        "votante.dataNascimento"
      ];
      
      if (tipoInscricao === "TRABALHADOR") {
        camposObrigatorios.push("votante.empresa");
      }
      
      console.log("📝 Campos obrigatórios:", camposObrigatorios);
      
      // Inicializar como true antes da validação
      isValid = true;
      
      // Validar cada campo individualmente
      for (const campo of camposObrigatorios) {
        const valor = getValues(campo as any);
        console.log(`🔍 Validando ${campo}:`, valor);
        const resultado = await trigger(campo as any);
        console.log(`${resultado ? '✅' : '❌'} ${campo}: ${resultado}`);
        if (!resultado) {
          isValid = false;
          break;
        }
      }
      
      console.log("🔍 Valor de isValid antes da validação completa:", isValid);
      if (isValid) {
        console.log("🔍 Validando objeto votante completo...");
        const votanteData = getValues("votante");
        console.log("📊 Dados do votante:", votanteData);
        
        isValid = await trigger("votante");
        console.log("✅ Resultado validação votante completo:", isValid);
        
        // Se falhou, vamos ver os erros específicos
        if (!isValid) {
          const errors = methods.formState.errors;
          console.log("❌ Erros encontrados:", errors);
        }
      }
      
      console.log("✅ Resultado final etapa 3:", isValid);
    } else if (etapaAtual === 4) {
      // Etapa 4: Documentos
      console.log("📄 Validando etapa 4 - Documentos");
      isValid = await trigger(["arquivos"]);
      console.log("✅ Resultado validação etapa 4:", isValid);
    } else if (etapaAtual === 5) {
      // Etapa 5: Revisão de dados - não precisa validação, apenas avança
      console.log("👀 Etapa 5 - Revisão de dados (sem validação)");
      isValid = true;
    } else if (etapaAtual === 6) {
      // Etapa 6: Declarações
      console.log("📋 Validando etapa 6 - Declarações");
      isValid = await trigger(["declaracoes"]);
      console.log("✅ Resultado validação etapa 6:", isValid);
    }

    console.log("🎯 RESULTADO FINAL DA VALIDAÇÃO:", isValid);

    if (isValid) {
      console.log("✅ Validação passou! Avançando para próxima etapa...");
      // Marcar etapa como completa
      if (!etapasCompletas.includes(etapaAtual)) {
        setEtapasCompletas([...etapasCompletas, etapaAtual]);
        console.log("📋 Etapa marcada como completa:", etapaAtual);
      }
      
      if (etapaAtual < etapas.length) {
        console.log(`➡️ Avançando da etapa ${etapaAtual} para ${etapaAtual + 1}`);
        setEtapaAtual(etapaAtual + 1);
      } else {
        console.log("🏁 Última etapa alcançada!");
      }
    } else {
      console.log("❌ Validação falhou! Não é possível avançar.");
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
      if (data.votante.nomeSocial) {
        formData.append("votante.nomeSocial", data.votante.nomeSocial);
      }
      formData.append("votante.telefone", data.votante.telefone);
      formData.append("votante.genero", data.votante.genero);
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
      
      // Adicionar declarações
      formData.append("declaracoes.declaracaoIdentidade", data.declaracoes.declaracaoIdentidade.toString());
      formData.append("declaracoes.declaracaoVotacao", data.declaracoes.declaracaoVotacao.toString());
      formData.append("declaracoes.declaracaoDocumento", data.declaracoes.declaracaoDocumento.toString());
      formData.append("declaracoes.declaracaoAutorizacao", data.declaracoes.declaracaoAutorizacao.toString());
      formData.append("declaracoes.declaracaoVeracidade", data.declaracoes.declaracaoVeracidade.toString());

      // Enviar para a API
      const response = await fetch("/api/inscricao", {
        method: "POST",
        body: formData,
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Erro ao enviar formulário");
      }

      // Redirecionar para página de agradecimento
      router.push("/agradecimento");
      
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
                    onClick={() => {
                      console.log("🖱️ BOTÃO PRÓXIMA CLICADO!");
                      proximaEtapa();
                    }}
                    disabled={!podeAvancar}
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