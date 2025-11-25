import { auth } from "@/auth";
import { atualizarStatusVotante } from "@/services/votantes";
import { Status } from "@prisma/client";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await request.json();
  const novoStatus = body?.status as Status;
  if (!['DEFERIDO', 'INDEFERIDO'].includes(novoStatus)) {
    return Response.json({ error: 'Status inválido' }, { status: 400 });
  }

  const atualizado = await atualizarStatusVotante(id, novoStatus, session.user.id);
  if (!atualizado) {
    return Response.json({ error: 'Falha ao atualizar status' }, { status: 400 });
  }
  return Response.json({ id: atualizado.id, status: atualizado.status });
}