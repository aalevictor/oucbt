"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ConsultaResposta = {
  found: boolean;
  cpf?: string;
  nome?: string | null;
  status?: "EM_ANALISE" | "DEFERIDO" | "INDEFERIDO" | null;
  criadoEm?: string;
  atualizadoEm?: string;
};

function limparCPF(valor: string) {
  return valor.replace(/\D/g, "");
}

function formatarCPF(valor: string) {
  const v = limparCPF(valor).slice(0, 11);
  const partes = [v.slice(0, 3), v.slice(3, 6), v.slice(6, 9), v.slice(9, 11)].filter(Boolean);
  if (partes.length === 4) return `${partes[0]}.${partes[1]}.${partes[2]}-${partes[3]}`;
  if (partes.length === 3) return `${partes[0]}.${partes[1]}.${partes[2]}`;
  if (partes.length === 2) return `${partes[0]}.${partes[1]}`;
  return partes[0] || "";
}

function validarCPF(valor: string) {
  const cpf = limparCPF(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf[10]);
}

function statusLabel(s?: ConsultaResposta["status"]) {
  switch (s) {
    case "EM_ANALISE":
      return { texto: "Em análise", estilo: "bg-yellow-500" };
    case "DEFERIDO":
      return { texto: "Deferido", estilo: "bg-green-600" };
    case "INDEFERIDO":
      return { texto: "Indeferido", estilo: "bg-red-600" };
    default:
      return { texto: "Não encontrado", estilo: "bg-gray-500" };
  }
}

export default function ConsultaCadastroPage() {
  const [cpfEntrada, setCpfEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<ConsultaResposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function consultar() {
    setErro(null);
    setResultado(null);
    const cpfLimpo = limparCPF(cpfEntrada);
    if (!validarCPF(cpfLimpo)) {
      setErro("CPF inválido. Verifique e tente novamente.");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch(`/api/consulta-cadastro/${cpfLimpo}`);
      const json: ConsultaResposta = await res.json();
      setResultado(json);
      if (!res.ok && !json.found) {
        setErro("CPF não encontrado.");
      }
    } catch (e) {
      setErro("Erro ao consultar. Tente novamente em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  const badge = statusLabel(resultado?.status ?? null);

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="text-center space-y-2 px-4">
          <h2 className="text-3xl font-bold">Consultar status da inscrição</h2>
          <p className="text-muted-foreground">Informe seu CPF para verificar se sua inscrição foi aceita, indeferida ou se ainda está em análise.</p>
        </div>

        <Card className="max-w-2xl mx-auto max-sm:rounded-none flex justify-between">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={formatarCPF(cpfEntrada)}
                  onChange={(e) => setCpfEntrada(e.target.value)}
                />
              </div>
              <Button onClick={consultar} disabled={carregando} className="md:self-end">
                {carregando ? "Consultando..." : "Consultar"}
              </Button>
            </div>

            {erro && (
              <div className="text-sm text-red-600">{erro}</div>
            )}

            {resultado && (
              <div className="space-y-2">
                {resultado.nome && (
                  <div className="text-sm text-muted-foreground">{resultado.nome}</div>
                )}
                <Badge className={`${badge.estilo} text-white`}>{badge.texto}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

