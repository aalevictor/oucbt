import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ cpf: string }> }
) {
  try {
    const { cpf } = await context.params;
    if (!cpf) {
      return NextResponse.json(
        { error: "CPF é obrigatório" },
        { status: 400 }
      );
    }

    // Remove formatação do CPF
    const cpfLimpo = cpf.replace(/[^\d]/g, '');

    // Verifica se o CPF já existe no banco
    const votanteExistente = await db.votante.findUnique({
      where: {
        cpf: cpfLimpo
      }
    });

    return NextResponse.json({
      disponivel: !votanteExistente,
      message: votanteExistente ? "CPF já cadastrado" : "CPF disponível"
    });

  } catch (error) {
    console.error("Erro ao validar CPF:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}