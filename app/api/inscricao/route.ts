import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { formularioInscricaoSchema } from "@/lib/schemas/formulario-inscricao";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  const limiteInscricao = new Date("2025-11-30T23:59:59.999Z");
  const agora = new Date();
  if (agora > limiteInscricao) {
    return NextResponse.json(
      { error: "Não é possível se inscrever fora do prazo." },
      { status: 400 }
    );
  }
  try {
    const formData = await request.formData();
    
    // Extrair arquivos
    const arquivos: File[] = [];
    let index = 0;
    while (formData.get(`arquivos[${index}]`)) {
      const arquivo = formData.get(`arquivos[${index}]`) as File;
      if (arquivo && arquivo.size > 0) {
        arquivos.push(arquivo);
      }
      index++;
    }
    
    // Extrair dados do formulário
    const dadosFormulario = {
      tipoInscricao: formData.get("tipoInscricao") as "MORADOR" | "TRABALHADOR",
      votante: {
        nome: formData.get("votante.nome") as string,
        nomeSocial: formData.get("votante.nomeSocial") as string || undefined,
        telefone: formData.get("votante.telefone") as string,
        genero: formData.get("votante.genero") as "MASCULINO" | "FEMININO" | "OUTRO",
        email: formData.get("votante.email") as string,
        cpf: formData.get("votante.cpf") as string,
        dataNascimento: formData.get("votante.dataNascimento") as string,
        empresa: formData.get("votante.empresa") as string || undefined,
      },
      endereco: {
        logradouro: formData.get("endereco.logradouro") as string,
        numero: formData.get("endereco.numero") as string || null,
        complemento: formData.get("endereco.complemento") as string || null,
        bairro: formData.get("endereco.bairro") as string,
        cidade: formData.get("endereco.cidade") as string,
        estado: formData.get("endereco.estado") as string,
        cep: formData.get("endereco.cep") as string,
        latitude: formData.get("endereco.latitude") ? parseFloat(formData.get("endereco.latitude") as string) : null,
        longitude: formData.get("endereco.longitude") ? parseFloat(formData.get("endereco.longitude") as string) : null,
      },
      arquivos: {
        arquivos: arquivos
      },
      declaracoes: {
        declaracaoIdentidade: formData.get("declaracoes.declaracaoIdentidade") === "true",
        declaracaoVotacao: formData.get("declaracoes.declaracaoVotacao") === "true",
        declaracaoDocumento: formData.get("declaracoes.declaracaoDocumento") === "true",
        declaracaoAutorizacao: formData.get("declaracoes.declaracaoAutorizacao") === "true",
        declaracaoVeracidade: formData.get("declaracoes.declaracaoVeracidade") === "true"
      }
    };

    // Validar dados com o schema
    const dadosValidados = formularioInscricaoSchema.parse(dadosFormulario);

    // Verificar existência de cadastro por email ou cpf
    const emailNormalizado = dadosValidados.votante.email.toLowerCase();
    const cpfNormalizado = dadosValidados.votante.cpf.replace(/[^\d]/g, "");

    const [existentePorEmail, existentePorCpf] = await Promise.all([
      db.votante.findUnique({ where: { email: emailNormalizado } }),
      db.votante.findUnique({ where: { cpf: cpfNormalizado } }),
    ]);

    const existente = existentePorEmail ?? existentePorCpf;

    // Se existe e não está indeferido, bloquear novo envio
    if (existente && existente.status !== "INDEFERIDO") {
      return NextResponse.json(
        { error: "Cadastro já existente (EM_ANÁLISE/DEFERIDO)." },
        { status: 400 }
      );
    }

    // Se existe e está INDEFERIDO, atualizar dados e substituir arquivos
    if (existente && existente.status === "INDEFERIDO") {
      const votanteId = existente.id;

      // Limpar diretório de uploads do votante (se existir)
      const uploadsDir = join(process.cwd(), "uploads");
      const votanteDir = join(uploadsDir, votanteId.toString());
      try {
        await rm(votanteDir, { recursive: true, force: true });
      } catch (e) {
        // Ignorar falhas ao remover diretório
      }

      // Recriar diretório
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      await mkdir(votanteDir, { recursive: true });

      const resultado = await db.$transaction(async (tx) => {
        // Atualizar dados do votante e retornar a EM_ANALISE
        const votanteAtualizado = await tx.votante.update({
          where: { id: votanteId },
          data: {
            tipoInscricao: dadosValidados.tipoInscricao,
            nome: dadosValidados.votante.nome,
            nomeSocial: dadosValidados.votante.nomeSocial || null,
            telefone: dadosValidados.votante.telefone,
            genero: dadosValidados.votante.genero,
            email: emailNormalizado,
            cpf: cpfNormalizado,
            dataNascimento: (() => {
              const parts = dadosValidados.votante.dataNascimento.split("-").map(Number);
              if (parts.length === 3) {
                const [ano, mes, dia] = parts;
                return new Date(ano, mes - 1, dia);
              }
              return new Date(dadosValidados.votante.dataNascimento);
            })(),
            empresa: dadosValidados.votante.empresa || null,
            status: "EM_ANALISE",
          }
        });

        // Upsert de endereço
        await tx.endereco.upsert({
          where: { votanteId },
          update: {
            logradouro: dadosValidados.endereco.logradouro,
            numero: dadosValidados.endereco.numero,
            complemento: dadosValidados.endereco.complemento,
            bairro: dadosValidados.endereco.bairro,
            cidade: dadosValidados.endereco.cidade,
            estado: dadosValidados.endereco.estado,
            cep: dadosValidados.endereco.cep,
            latitude: dadosValidados.endereco.latitude,
            longitude: dadosValidados.endereco.longitude,
          },
          create: {
            logradouro: dadosValidados.endereco.logradouro,
            numero: dadosValidados.endereco.numero,
            complemento: dadosValidados.endereco.complemento,
            bairro: dadosValidados.endereco.bairro,
            cidade: dadosValidados.endereco.cidade,
            estado: dadosValidados.endereco.estado,
            cep: dadosValidados.endereco.cep,
            latitude: dadosValidados.endereco.latitude,
            longitude: dadosValidados.endereco.longitude,
            votanteId,
          },
        });

        // Apagar registros antigos de arquivos
        await tx.arquivo.deleteMany({ where: { votanteId } });

        // Salvar novos arquivos
        const arquivosSalvos: { nome: string; tipo: string; tamanho: number; caminho: string }[] = [];
        if (dadosValidados.arquivos && dadosValidados.arquivos.arquivos && dadosValidados.arquivos.arquivos.length > 0) {
          for (const arquivo of dadosValidados.arquivos.arquivos) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2);
            const nomeArquivo = `${timestamp}-${random}-${arquivo.name}`;
            const caminhoArquivo = join(votanteDir, nomeArquivo);

            const bytes = await arquivo.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(caminhoArquivo, buffer);

            arquivosSalvos.push({
              nome: arquivo.name,
              tipo: arquivo.type,
              tamanho: arquivo.size,
              caminho: caminhoArquivo,
            });
          }
        }

        // Criar registros dos novos arquivos
        for (const arquivoSalvo of arquivosSalvos) {
          await tx.arquivo.create({
            data: {
              nome: arquivoSalvo.nome,
              tipo: arquivoSalvo.tipo,
              tamanho: arquivoSalvo.tamanho,
              caminho: arquivoSalvo.caminho,
              votanteId,
            }
          });
        }

        return votanteAtualizado;
      });

      return NextResponse.json({
        success: true,
        message: "Reenvio realizado com sucesso! Dados atualizados e arquivos substituídos.",
        votanteId: resultado.id,
      });
    }

    // Salvar no banco de dados usando transação
    const resultado = await db.$transaction(async (tx) => {
      // Criar votante primeiro para obter o ID
      const votante = await tx.votante.create({
        data: {
          tipoInscricao: dadosValidados.tipoInscricao,
          nome: dadosValidados.votante.nome,
          nomeSocial: dadosValidados.votante.nomeSocial || null,
          telefone: dadosValidados.votante.telefone,
          genero: dadosValidados.votante.genero,
          email: dadosValidados.votante.email.toLowerCase(),
          cpf: dadosValidados.votante.cpf.replace(/[^\d]/g, ''),
          // Interpretar 'YYYY-MM-DD' como data local para evitar regressão por fuso horário
          dataNascimento: (() => {
            const parts = dadosValidados.votante.dataNascimento.split("-").map(Number);
            if (parts.length === 3) {
              const [ano, mes, dia] = parts;
              return new Date(ano, mes - 1, dia);
            }
            return new Date(dadosValidados.votante.dataNascimento);
          })(),
          empresa: dadosValidados.votante.empresa || null,
          status: "EM_ANALISE",
        }
      });

      // Criar endereço
      await tx.endereco.create({
        data: {
          logradouro: dadosValidados.endereco.logradouro,
          numero: dadosValidados.endereco.numero,
          complemento: dadosValidados.endereco.complemento,
          bairro: dadosValidados.endereco.bairro,
          cidade: dadosValidados.endereco.cidade,
          estado: dadosValidados.endereco.estado,
          cep: dadosValidados.endereco.cep,
          latitude: dadosValidados.endereco.latitude,
          longitude: dadosValidados.endereco.longitude,
          votanteId: votante.id,
        }
      });

      // Processar e salvar arquivos após ter o ID do votante
      const arquivosSalvos: { nome: string; tipo: string; tamanho: number; caminho: string }[] = [];
      
      if (dadosValidados.arquivos && dadosValidados.arquivos.arquivos && dadosValidados.arquivos.arquivos.length > 0) {
        // Criar diretório específico para o votante
        const uploadsDir = join(process.cwd(), "uploads");
        const votanteDir = join(uploadsDir, votante.id.toString());
        
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        
        if (!existsSync(votanteDir)) {
          await mkdir(votanteDir, { recursive: true });
        }

        for (const arquivo of dadosValidados.arquivos.arquivos) {
          // Gerar nome único para o arquivo
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2);
          const nomeArquivo = `${timestamp}-${random}-${arquivo.name}`;
          const caminhoArquivo = join(votanteDir, nomeArquivo);

          // Salvar arquivo
          const bytes = await arquivo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(caminhoArquivo, buffer);

          arquivosSalvos.push({
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size,
            caminho: caminhoArquivo
          });
        }
      }

      // Criar registros dos arquivos
      for (const arquivoSalvo of arquivosSalvos) {
        await tx.arquivo.create({
          data: {
            nome: arquivoSalvo.nome,
            tipo: arquivoSalvo.tipo,
            tamanho: arquivoSalvo.tamanho,
            caminho: arquivoSalvo.caminho,
            votanteId: votante.id,
          }
        });
      }

      return votante;
    });

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso!",
      votanteId: resultado.id
    });

  } catch (error) {
    console.error("Erro ao processar inscrição:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}