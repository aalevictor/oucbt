import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ login: string }> }
) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { login } = await context.params;
    return await fetch(`${process.env.AUTH_SERVER}ldap/buscar-por-login/${login}?secretarias=SMUL,SPURBANISMO`);
}   