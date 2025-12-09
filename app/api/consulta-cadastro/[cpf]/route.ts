import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Consulta pública do status de cadastro por CPF
export async function GET(
  _request: Request,
  context: { params: Promise<{ cpf: string }> }
) {
  try {
    const { cpf } = await context.params;
    const cpfLimpo = (cpf || "").replace(/\D/g, "");

    if (!cpfLimpo || cpfLimpo.length !== 11) {
      return NextResponse.json(
        { message: "CPF inválido", found: false },
        { status: 400 }
      );
    }

    const votante = await db.votante.findUnique({
      where: { cpf: cpfLimpo },
      select: {
        id: true,
        cpf: true,
        nome: true,
        status: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    if (!votante) {
      return NextResponse.json({ found: false, status: null }, { status: 404 });
    }

    return NextResponse.json(
      {
        found: true,
        cpf: votante.cpf,
        nome: votante.nome,
        status: votante.status,
        criadoEm: votante.criadoEm,
        atualizadoEm: votante.atualizadoEm,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao consultar CPF:", error);
    return NextResponse.json(
      { message: "Erro interno ao consultar CPF" },
      { status: 500 }
    );
  }
}

