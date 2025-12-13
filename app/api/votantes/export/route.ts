/** @format */

import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const votantes = await db.votante.findMany({
      where: { status: "DEFERIDO" },
      orderBy: { nome: "asc" },
      select: {
        nome: true,
        cpf: true,
        dataNascimento: true,
      },
    });

    const linhas = votantes.map((v) => {
      const cpf = (v.cpf || "").replace(/[^\d]/g, "");
      const nome = (v.nome || "").trim();
      // Formatar data como YYYY-MM-DD usando a parte UTC para evitar deslocamento
      const data = v.dataNascimento
        ? new Date(v.dataNascimento).toISOString().slice(0, 10)
        : "";
      return `${cpf}|${nome}|${data}|${cpf}`;
    });

    const header = "IDENTIFICACAO|NOME|DATA_NASCIMENTO|CPF";
    const conteudo = [header, ...linhas].join("\n") + "\n";

    return new Response(conteudo, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=deferidos.txt",
      },
    });
  } catch (error) {
    console.error("Erro ao exportar deferidos:", error);
    return new Response("Erro ao exportar deferidos", { status: 500 });
  }
}