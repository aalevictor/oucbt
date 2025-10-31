"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileArchive, Info } from "lucide-react";
import DragDropInput from "@/components/drag-drop-input";
import type { FormularioInscricaoData } from "@/lib/schemas/formulario-inscricao";

export default function EtapaArquivo() {
  const { 
    control, 
    formState: { errors }, 
    watch 
  } = useFormContext<FormularioInscricaoData>();

  const tipoInscricao = watch("tipoInscricao");

  const [arquivosInfo, setArquivosInfo] = useState<Array<{
    nome: string;
    tamanho: string;
    tipo: string;
  }>>([]);

  const arquivosValue = watch("arquivos.arquivos");

  // Função para formatar tamanho do arquivo
  const formatarTamanho = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  // Sincronizar informações dos arquivos com o valor do formulário
  useEffect(() => {
    if (arquivosValue && Array.isArray(arquivosValue) && arquivosValue.length > 0) {
      const infos = arquivosValue.map(arquivo => ({
        nome: arquivo.name,
        tamanho: formatarTamanho(arquivo.size),
        tipo: arquivo.type || "Arquivo"
      }));
      setArquivosInfo(infos);
    } else {
      setArquivosInfo([]);
    }
  }, [arquivosValue, formatarTamanho]);

  // Handler para quando arquivos são selecionados
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      // Atualizar informações dos arquivos
      const infos = files.map(arquivo => ({
        nome: arquivo.name,
        tamanho: formatarTamanho(arquivo.size),
        tipo: arquivo.type || "Arquivo"
      }));
      setArquivosInfo(infos);
    } else {
      setArquivosInfo([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista de documentos necessários por tipo */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Documentos necessários para {tipoInscricao === "TRABALHADOR" ? "Trabalhador" : "Morador"}:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Documento oficial com foto</li>
            <li>• CPF (caso não conste no documento de identificação)</li>
            {tipoInscricao === "TRABALHADOR" ? (
              <li>• CTPS ou contrato de trabalho</li>
            ) : (
              <li>• Comprovante de residência no perímetro de adesão da OUCBT</li>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Informações sobre o upload */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Requisitos dos arquivos:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Tipos aceitos: Imagens (JPG, PNG, GIF, WebP) e arquivos ZIP</li>
            <li>• Tamanho individual: Máximo 10MB por arquivo</li>
            <li>• Quantidade: Pelo menos 1 arquivo</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Campo de upload */}
      <div className="space-y-2">
        <Label htmlFor="arquivos">Arquivos de Documentos *</Label>
        <Controller
          name="arquivos.arquivos"
          control={control}
          render={({ field }) => (
            <DragDropInput
              onChange={(files) => {
                field.onChange(files);
                handleFileChange(files);
              }}
              value={field.value || []}
              multiple={true}
              maxFiles={10}
              maxSize={10 * 1024 * 1024} // 10MB por arquivo
              accept="image/*,.zip"
              buttonText="Selecionar arquivos"
              dropzoneText="Arraste e solte seus arquivos aqui"
              helperText="Imagens (JPG, PNG, GIF, WebP) e arquivos ZIP aceitos. Máximo 10MB por arquivo"
              error={errors.arquivos?.message}
            />
          )}
        />
      </div>

      {/* Exibir informações dos arquivos selecionados */}
      {arquivosInfo.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Arquivos selecionados ({arquivosInfo.length})
          </h4>
          <div className="space-y-2">
            {arquivosInfo.map((arquivo, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileArchive className="h-6 w-6 text-blue-500" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {arquivo.nome}
                    </h5>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Tamanho: {arquivo.tamanho}</span>
                      <span>Tipo: {arquivo.tipo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar erro se houver */}
      {errors.arquivos && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.arquivos.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Instruções adicionais */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Certifique-se de que o arquivo .zip contém todos os documentos 
          necessários para sua inscrição. Após o envio, não será possível alterar o arquivo.
        </AlertDescription>
      </Alert>
    </div>
  );
}