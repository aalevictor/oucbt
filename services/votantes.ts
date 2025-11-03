import { db } from "@/lib/prisma";
import { verificaLimite, verificaPagina } from "@/lib/utils";
import { Arquivo, Endereco, Status, Votante } from "@prisma/client";

export interface IVotantePaginado {
    data: IVotante[];
    total: number;
    pagina: number;
    limite: number;
}
export interface IVotante extends Votante {
    endereco?: Endereco;
    arquivos?: Arquivo[];
}

export async function buscarVotantes(
    pagina: number,
    limite: number,
    busca?: string,
    status?: string,
) {
    [pagina, limite] = verificaPagina(pagina, limite);
    const where = {
        ...(busca && {
            OR: [
                { nome: { contains: busca } },
                { email: { contains: busca } },
            ],
        }),
        ...(status && status !== 'all' && { status: status as Status }),
    }
    const total = await db.votante.count({ where });
    if (total === 0) return { data: [], total, pagina, limite };
    [pagina, limite] = verificaLimite(pagina, limite, total);
    const usuarios = await db.votante.findMany({
        skip: (pagina - 1) * limite,
        take: limite,
        include: {
            endereco: true,
            arquivos: {
                select: { id: true }
            },
        },
        where
    });
    return { data: usuarios, total, pagina, limite };
}