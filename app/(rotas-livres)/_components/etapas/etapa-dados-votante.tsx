"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormularioInscricaoData } from "@/lib/schemas/formulario-inscricao";

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  return true;
}

// Função para formatar CPF
function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export default function EtapaDadosVotante() {
  const { 
    register, 
    formState: { errors }, 
    watch, 
    setValue,
    setError,
    clearErrors
  } = useFormContext<FormularioInscricaoData>();

  const [validandoCPF, setValidandoCPF] = useState(false);
  const [validandoEmail, setValidandoEmail] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [emailValido, setEmailValido] = useState<boolean | null>(null);

  const cpfValue = watch("votante.cpf");
  const emailValue = watch("votante.email");
  const tipoInscricao = watch("tipoInscricao");

  // Validação de CPF em tempo real
  const validarCPFUnico = async (cpf: string) => {
    if (!cpf || cpf.length < 14) return;
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    if (!validarCPF(cpfLimpo)) {
      setError("votante.cpf", { 
        type: "manual", 
        message: "CPF inválido" 
      });
      setCpfValido(false);
      return;
    }
    setValidandoCPF(true);
    try {
      const response = await fetch(`/api/validacao/cpf/${cpfLimpo}`);
      const data = await response.json();
      if (data.disponivel) {
        clearErrors("votante.cpf");
        setCpfValido(true);
      } else {
        setError("votante.cpf", { 
          type: "manual", 
          message: "Este CPF já está cadastrado" 
        });
        setCpfValido(false);
      }
    } catch (error) {
      console.error("Erro ao validar CPF:", error);
      setError("votante.cpf", { 
        type: "manual", 
        message: "Erro ao validar CPF. Tente novamente." 
      });
      setCpfValido(false);
    } finally {
      setValidandoCPF(false);
    }
  };

  // Validação de email único
  const validarEmailUnico = async (email: string) => {
    if (!email || !email.includes("@")) return;

    setValidandoEmail(true);
    try {
      const response = await fetch(`/api/validacao/email/${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!data.disponivel) {
        setError("votante.email", { 
          type: "manual", 
          message: "Este e-mail já está cadastrado" 
        });
        setEmailValido(false);
      } else {
        clearErrors("votante.email");
        setEmailValido(true);
      }
    } catch (error) {
      console.error("Erro ao validar e-mail:", error);
      setError("votante.email", { 
        type: "manual", 
        message: "Erro ao validar e-mail. Tente novamente." 
      });
      setEmailValido(false);
    } finally {
      setValidandoEmail(false);
    }
  };

  // Handler para formatação do CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const cpfFormatado = formatarCPF(valor);
    setValue("votante.cpf", cpfFormatado);
    
    // Reset do estado de validação
    setCpfValido(null);
    
    // Validar após um delay
    setTimeout(() => {
      validarCPFUnico(cpfFormatado);
    }, 500);
  };

  // Handler para validação do email
  const handleEmailBlur = () => {
    if (emailValue) {
      validarEmailUnico(emailValue);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nome Completo */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          {...register("votante.nome")}
          placeholder="Digite seu nome completo"
          className={cn(
            errors.votante?.nome && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.votante?.nome && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.votante.nome.message}
          </p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register("votante.email")}
            onBlur={handleEmailBlur}
            placeholder="Digite seu e-mail"
            className={cn(
              errors.votante?.email && "border-red-500 focus-visible:ring-red-500",
              emailValido === true && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          {validandoEmail && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!validandoEmail && emailValido === true && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
        {errors.votante?.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.votante.email.message}
          </p>
        )}
      </div>

      {/* CPF */}
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <div className="relative">
          <Input
            id="cpf"
            {...register("votante.cpf")}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className={cn(
              errors.votante?.cpf && "border-red-500 focus-visible:ring-red-500",
              cpfValido === true && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          {validandoCPF && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!validandoCPF && cpfValido === true && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
        {errors.votante?.cpf && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.votante.cpf.message}
          </p>
        )}
      </div>

      {/* Data de Nascimento */}
      <div className="space-y-2">
        <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
        <Input
          id="dataNascimento"
          type="date"
          {...register("votante.dataNascimento")}
          className={cn(
            errors.votante?.dataNascimento && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.votante?.dataNascimento && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.votante.dataNascimento.message}
          </p>
        )}
      </div>

      {/* Campo Empresa - apenas para TRABALHADOR */}
      {tipoInscricao === "TRABALHADOR" && (
        <div className="space-y-2">
          <Label htmlFor="empresa">Nome da Empresa *</Label>
          <Input
            id="empresa"
            {...register("votante.empresa")}
            placeholder="Digite o nome da empresa onde trabalha"
            className={cn(
              errors.votante?.empresa && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.votante?.empresa && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.votante.empresa.message}
            </p>
          )}
        </div>
      )}

      {/* Informações importantes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Certifique-se de que todos os dados estão corretos. 
          O CPF e e-mail serão verificados automaticamente para evitar duplicatas.
        </AlertDescription>
      </Alert>
    </div>
  );
}