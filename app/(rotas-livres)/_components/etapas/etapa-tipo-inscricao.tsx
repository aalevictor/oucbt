"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormularioInscricaoData } from "@/lib/schemas/formulario-inscricao";

export default function EtapaTipoInscricao() {
  const { 
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<FormularioInscricaoData>();

  const tipoInscricao = watch("tipoInscricao");

  const handleTipoChange = (value: "MORADOR" | "TRABALHADOR") => {
    setValue("tipoInscricao", value);
    // Limpar campo empresa se mudou para MORADOR
    if (value === "MORADOR") {
      setValue("votante.empresa", "");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Como você participa da região?</h3>
        <p className="text-sm text-muted-foreground">
          Selecione a opção que melhor descreve sua relação com a região da OUCBT
        </p>
      </div>

      <RadioGroup
        value={tipoInscricao}
        onValueChange={handleTipoChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="MORADOR" id="morador" className="sr-only" />
          <Label
            htmlFor="morador"
            className="flex-1 cursor-pointer"
          >
            <Card className={cn(
              "transition-all duration-200 hover:shadow-md",
              tipoInscricao === "MORADOR" 
                ? "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                : "border-border hover:border-blue-200 dark:hover:border-blue-800"
            )}>
              <CardHeader className="text-center pb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-800/40 flex items-center justify-center mb-2">
                  <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Morador da Região</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center">
                  Eu moro na região do perímetro de adesão da OUCBT
                </CardDescription>
              </CardContent>
            </Card>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="TRABALHADOR" id="trabalhador" className="sr-only" />
          <Label
            htmlFor="trabalhador"
            className="flex-1 cursor-pointer"
          >
            <Card className={cn(
              "transition-all duration-200 hover:shadow-md",
              tipoInscricao === "TRABALHADOR" 
                ? "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                : "border-border hover:border-green-200 dark:hover:border-green-800"
            )}>
              <CardHeader className="text-center pb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40 flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Trabalhador na Região</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center">
                  Eu trabalho na região do perímetro de adesão da OUCBT
                </CardDescription>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>

      {errors.tipoInscricao && (
        <p className="text-sm text-destructive text-center">
          {errors.tipoInscricao.message}
        </p>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Informações importantes:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Moradores:</strong> Devem comprovar residência no perímetro de adesão</li>
          <li>• <strong>Trabalhadores:</strong> Devem comprovar vínculo empregatício na região</li>
          <li>• A documentação necessária varia conforme o tipo selecionado</li>
        </ul>
      </div>
    </div>
  );
}