import { z } from "zod";

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Schema para Etapa 1: Tipo de Inscrição
export const tipoInscricaoSchema = z.object({
  tipoInscricao: z.enum(["MORADOR", "TRABALHADOR"], {
    required_error: "Selecione o tipo de inscrição",
    invalid_type_error: "Tipo de inscrição inválido"
  })
});

// Schema para Etapa 2: Dados do Votante
export const votanteSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  nomeSocial: z
    .string()
    .max(100, "Nome social deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "Nome social deve conter apenas letras e espaços")
    .optional()
    .or(z.literal("")),
  
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve ter o formato (00) 00000-0000"),
  
  genero: z.enum(["MASCULINO", "FEMININO", "OUTRO"], {
    required_error: "Selecione o gênero",
    invalid_type_error: "Gênero inválido"
  }),
  
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email deve ter no máximo 100 caracteres"),
  
  cpf: z
    .string()
    .min(11, "CPF deve ter 11 dígitos")
    .max(14, "CPF inválido")
    .refine((cpf) => validarCPF(cpf), "CPF inválido"),
  
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((data) => {
      const parts = data.split("-").map(Number);
      if (parts.length !== 3) return false;
      const [ano, mes, dia] = parts;
      const hoje = new Date();
      let idade = hoje.getFullYear() - ano;
      const mesDiff = hoje.getMonth() - (mes - 1);
      if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < dia)) {
        idade--;
      }
      return idade >= 16 && idade <= 120;
    }, "Você deve ter pelo menos 16 anos para se inscrever"),
  
  empresa: z
    .string()
    .max(200, "Nome da empresa deve ter no máximo 200 caracteres")
    .optional()
});

// Schema para Etapa 2: Endereço
export const enderecoSchema = z.object({
  logradouro: z
    .string()
    .min(5, "Logradouro deve ter pelo menos 5 caracteres")
    .max(200, "Logradouro deve ter no máximo 200 caracteres"),
  
  numero: z
    .string()
    .optional()
    .nullable(),
  
  complemento: z
    .string()
    .max(100, "Complemento deve ter no máximo 100 caracteres")
    .optional()
    .nullable(),
  
  bairro: z
    .string()
    .min(2, "Bairro deve ter pelo menos 2 caracteres")
    .max(100, "Bairro deve ter no máximo 100 caracteres"),
  
  cidade: z
    .string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(100, "Cidade deve ter no máximo 100 caracteres"),
  
  estado: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado deve ser uma sigla válida (ex: SP)"),
  
  cep: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP deve ter o formato 00000-000"),
  
  latitude: z
    .number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida")
    .optional()
    .nullable(),
  
  longitude: z
    .number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida")
    .optional()
    .nullable()
});

// Schema para Etapa 4: Arquivos
export const arquivosSchema = z.object({
  arquivos: z
    .array(z.instanceof(File))
    .min(1, "Selecione pelo menos um arquivo")
    .max(5, "Máximo de 5 arquivos permitidos")
    .refine((files) => {
      const tamanhoTotal = files.reduce((total, file) => total + file.size, 0);
      return tamanhoTotal <= 30 * 1024 * 1024; // 30MB
    }, "O tamanho total dos arquivos não pode exceder 30MB")
    .refine((files) => {
      const tiposPermitidos = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/zip', 'application/x-zip-compressed'
      ];
      return files.every(file => 
        tiposPermitidos.includes(file.type) || 
        file.name.toLowerCase().endsWith('.zip') ||
        file.name.toLowerCase().endsWith('.jpg') ||
        file.name.toLowerCase().endsWith('.jpeg') ||
        file.name.toLowerCase().endsWith('.png') ||
        file.name.toLowerCase().endsWith('.gif') ||
        file.name.toLowerCase().endsWith('.webp')
      );
    }, "Apenas arquivos de imagem (JPG, PNG, GIF, WebP) e ZIP são permitidos")
});

// Schema para Etapa 6: Declarações
export const declaracoesSchema = z.object({
  declaracaoIdentidade: z.boolean().refine(val => val === true, "Você deve aceitar esta declaração"),
  declaracaoVotacao: z.boolean().refine(val => val === true, "Você deve aceitar esta declaração"),
  declaracaoDocumento: z.boolean().refine(val => val === true, "Você deve aceitar esta declaração"),
  declaracaoAutorizacao: z.boolean().refine(val => val === true, "Você deve aceitar esta declaração"),
  declaracaoVeracidade: z.boolean().refine(val => val === true, "Você deve aceitar esta declaração")
});

// Schema completo do formulário
export const formularioInscricaoSchema = z.object({
  tipoInscricao: z.enum(["MORADOR", "TRABALHADOR"]),
  votante: votanteSchema,
  endereco: enderecoSchema,
  arquivos: arquivosSchema,
  declaracoes: declaracoesSchema
}).refine((data) => {
  // Se for TRABALHADOR, empresa é obrigatória
  if (data.tipoInscricao === "TRABALHADOR") {
    return data.votante.empresa && data.votante.empresa.trim().length > 0;
  }
  return true;
}, {
  message: "Nome da empresa é obrigatório para trabalhadores",
  path: ["votante", "empresa"]
});

// Tipos TypeScript derivados dos schemas
export type TipoInscricaoFormData = z.infer<typeof tipoInscricaoSchema>;
export type VotanteFormData = z.infer<typeof votanteSchema>;
export type EnderecoFormData = z.infer<typeof enderecoSchema>;
export type ArquivosFormData = z.infer<typeof arquivosSchema>;
export type DeclaracoesFormData = z.infer<typeof declaracoesSchema>;
export type FormularioInscricaoData = z.infer<typeof formularioInscricaoSchema>;

// Schemas individuais para cada etapa (para validação parcial)
export const etapaSchemas = {
  1: tipoInscricaoSchema,
  2: enderecoSchema,
  3: votanteSchema,
  4: arquivosSchema,
  5: z.object({}), // Etapa de revisão não precisa de validação
  6: declaracoesSchema
} as const;