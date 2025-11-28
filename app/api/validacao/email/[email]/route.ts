import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await context.params;
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }
    const [votanteExistente] = await Promise.all([
      db.votante.findUnique({
        where: { 
          email: email.toLowerCase(),
          status: {
            in: ['DEFERIDO', 'EM_ANALISE']
          }
        }
      }),
    ]);
    const emailJaCadastrado = votanteExistente;
    return NextResponse.json({
      disponivel: !emailJaCadastrado,
      message: emailJaCadastrado ? "Email já cadastrado" : "Email disponível"
    });
  } catch (error) {
    console.error("Erro ao validar email:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}