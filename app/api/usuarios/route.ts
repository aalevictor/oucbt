import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { Permissao } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 });
    const data = await request.json();
	const { email, login, nome, permissao } = data;
    if (!login || !nome || !email) return Response.json({ error: 'Preencha os campos obrigatórios' }, { status: 400 });
    const permissaoValida = permissao as Permissao || Permissao.ADM;
    const usuarioNovo = await db.usuario.upsert({
        where: {
            login,
        },
        create: {
            email,
            login,
            nome,
            permissao: permissaoValida,
        },
        update: {
            permissao: permissaoValida,
        },
    });
    if (!usuarioNovo) return Response.json({ error: 'Algo deu errado' }, { status: 500 });
    return Response.json({ usuarioNovo }, { status: 201 });
}