"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import MapaEnderecoOpenLayers from "./mapa-endereco-simples";
import { isWithinOUCBTPerimeter } from "@/lib/utils/polygon-validation";

interface EnderecoData {
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function EtapaEndereco() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const watchedFields = watch("endereco") as EnderecoData;
  const cep = watchedFields?.cep || "";
  const buscarCep = async () => {
    if (!cep || cep.length < 8) {
      toast.error("Digite um CEP válido");
      return;
    }

    setIsLoadingCep(true);
    try {
      const cepLimpo = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setValue("endereco.logradouro", data.logradouro);
      setValue("endereco.bairro", data.bairro);
      setValue("endereco.cidade", data.localidade);
      setValue("endereco.estado", data.uf);
      setValue("endereco.complemento", data.complemento);
      await geocodeAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`);
      
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Geocodificar endereço para obter coordenadas
  const geocodeAddress = async (address: string) => {
    try {
      // Extrair partes do endereço
      const parts = address.split(', ');
      const logradouro = parts[0] || '';
      const bairro = parts[1] || '';
      const cidade = parts[2] || '';
      const estado = parts[3] || '';

      // Tentar múltiplas consultas para melhor precisão
      const queries = [
        address, // Consulta original
        `${address}, Brasil`, // Com país
        `${address}, São Paulo, Brasil`, // Com estado e país
        // Variações do nome da rua
        logradouro.replace('Estrada ', '').replace('Rua ', '').replace('Avenida ', '') + `, ${bairro}, ${cidade}, ${estado}`,
        // Busca simplificada sem "Estrada"
        logradouro.replace('Estrada ', '') + `, ${cidade}, ${estado}, Brasil`,
        // Busca apenas por bairro e cidade (fallback)
        `${bairro}, ${cidade}, ${estado}, Brasil`,
        // Busca por cidade e bairro com região metropolitana
        `${bairro}, ${cidade}, Região Metropolitana de São Paulo, Brasil`,
      ];

      let bestResult = null;
      
      for (const query of queries) {
        if (!query.trim()) continue; // Pular consultas vazias
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          // Filtrar resultados para priorizar São Paulo capital
          const saoPauloResults = data.filter((result: any) => 
            result.address && 
            (result.address.city === 'São Paulo' || 
             result.address.municipality?.includes('São Paulo') ||
             result.display_name?.includes('São Paulo, Região'))
          );
          
          const resultsToCheck = saoPauloResults.length > 0 ? saoPauloResults : data;
          
          // Priorizar resultados que tenham mais detalhes de endereço
          const detailedResult = resultsToCheck.find((result: { address: { road: any; pedestrian: any; postcode: any; }; }) => 
            result.address && 
            (result.address.road || result.address.pedestrian) &&
            result.address.postcode
          );
          
          if (detailedResult) {
            bestResult = detailedResult;
            break;
          } else if (!bestResult && resultsToCheck.length > 0) {
            bestResult = resultsToCheck[0];
          }
        }
      }

      if (bestResult) {
        const lat = parseFloat(bestResult.lat);
        const lng = parseFloat(bestResult.lon);
        
        // Validar se está dentro do perímetro
        const isValid = isWithinOUCBTPerimeter(lat, lng);
        
        setValue("endereco.latitude", lat);
        setValue("endereco.longitude", lng);
        
        if (isValid) {
          toast.success("Endereço localizado no mapa e dentro do perímetro de atendimento");
        } else {
          toast.error("Endereço localizado, mas está fora do perímetro de atendimento da OUCBT");
          // Limpar campos de endereço quando fora do perímetro
          setValue("endereco.logradouro", "");
          setValue("endereco.numero", "");
          setValue("endereco.bairro", "");
          setValue("endereco.cidade", "");
          setValue("endereco.estado", "");
          setValue("endereco.complemento", "");
        }
      } else {
        toast.warning("Não foi possível localizar o endereço no mapa");
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error);
      toast.error("Erro ao localizar endereço no mapa");
    }
  };

  return (
    <div className="space-y-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                {...register("endereco.cep")}
                maxLength={9}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 5) {
                    value = value.replace(/(\d{5})(\d)/, "$1-$2");
                  }
                  e.target.value = value;
                  setValue("endereco.cep", value);
                }}
              />
              {(errors.endereco as any)?.cep && (
                <p className="text-sm text-red-500 mt-1">
                  {(errors.endereco as any)?.cep?.message}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={buscarCep}
                disabled={isLoadingCep || !cep}
                className="flex items-center gap-2"
              >
                {isLoadingCep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="logradouro">Logradouro *</Label>
              <Input
                id="logradouro"
                placeholder="Rua, Avenida, etc."
                {...register("endereco.logradouro")}
              />
              {(errors.endereco as any)?.logradouro && (
                <p className="text-sm text-red-500 mt-1">
                  {(errors.endereco as any)?.logradouro?.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                placeholder="123"
                {...register("endereco.numero")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, Bloco, etc."
              {...register("endereco.complemento")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                placeholder="Nome do bairro"
                {...register("endereco.bairro")}
              />
              {(errors.endereco as any)?.bairro && (
                <p className="text-sm text-red-500 mt-1">
                  {(errors.endereco as any)?.bairro?.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                placeholder="Nome da cidade"
                {...register("endereco.cidade")}
              />
              {(errors.endereco as any)?.cidade && (
                <p className="text-sm text-red-500 mt-1">
                  {(errors.endereco as any)?.cidade?.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                placeholder="SP"
                maxLength={2}
                {...register("endereco.estado")}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  setValue("endereco.estado", e.target.value);
                }}
              />
              {(errors.endereco as any)?.estado && (
                <p className="text-sm text-red-500 mt-1">
                  {(errors.endereco as any)?.estado?.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Clique no mapa para selecionar a localização exata ou use a busca por CEP acima
          </p>
          <MapaEnderecoOpenLayers />
          
          {/* Coordenadas (campos ocultos) */}
          <input type="hidden" {...register("endereco.latitude")} />
          <input type="hidden" {...register("endereco.longitude")} />
    </div>
  );
}