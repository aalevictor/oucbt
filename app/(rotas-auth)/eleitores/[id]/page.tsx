/** @format */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, FileText, Download } from 'lucide-react';
import { buscarVotantePorId } from '@/services/votantes';
import StatusActions from './status-actions';

function formatarCPF(cpf: string) {
  const somenteDigitos = cpf.replace(/\D/g, '');
  return somenteDigitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCEP(cep: string) {
  const somenteDigitos = cep.replace(/\D/g, '');
  return somenteDigitos.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function formatarData(dataISO: Date | string) {
  if (!dataISO) return '';
  // Tratar string 'YYYY-MM-DD' como data local (sem fuso)
  if (typeof dataISO === 'string') {
    const iso = dataISO.slice(0, 10); // YYYY-MM-DD
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [ano, mes, dia] = parts;
      return `${dia}/${mes}/${ano}`;
    }
  }
  // Para Date, usar UTC ISO para extrair a parte da data
  try {
    const d = new Date(dataISO);
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD em UTC
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch {
    return String(dataISO);
  }
}

function formatarGenero(genero: string) {
  const generos: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMININO: 'Feminino',
    OUTRO: 'Outro',
  };
  return generos[genero] || genero;
}

function formatarTamanho(bytes: number) {
  if (!bytes && bytes !== 0) return '';
  const kb = 1024;
  const mb = kb * 1024;
  if (bytes < kb) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / kb).toFixed(2)} KB`;
  return `${(bytes / mb).toFixed(2)} MB`;
}

export default async function VotanteDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const votante = await buscarVotantePorId(id);

  if (!votante) {
    return (
      <div className="px-0 md:px-8 container mx-auto">
        <h1 className="text-xl md:text-3xl font-bold">Votante</h1>
        <p className="text-sm text-muted-foreground">Registro não encontrado.</p>
      </div>
    );
  }

  const endereco = votante.endereco;
  const arquivos = votante.arquivos || [];

  return (
    <div className="px-0 md:px-8 container mx-auto space-y-6 pb-20 md:pb-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-4xl font-bold">Eleitor</h1>
          <p className="text-sm text-muted-foreground">Detalhes completos da inscrição</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="capitalize" variant={votante.tipoInscricao === 'MORADOR' ? 'success' : 'default'}>
            {votante.tipoInscricao === 'MORADOR' ? 'Morador' : 'Trabalhador'}
          </Badge>
          <Badge className="capitalize" variant={votante.status === 'DEFERIDO' ? 'success' : votante.status === 'INDEFERIDO' ? 'destructive' : 'default'}>
            {votante.status === 'DEFERIDO' ? 'Deferido' : votante.status === 'INDEFERIDO' ? 'Indeferido' : 'Em Análise'}
          </Badge>
        </div>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-sm">{votante.nome}</p>
            </div>
            {votante.nomeSocial && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome Social</p>
                <p className="text-sm">{votante.nomeSocial}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p className="text-sm">{formatarCPF(votante.cpf)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-sm">{formatarData(votante.dataNascimento)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gênero</p>
              <p className="text-sm">{formatarGenero(votante.genero)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-mail</p>
              <p className="text-sm">{votante.email}</p>
            </div>
            {votante.telefone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="text-sm">{votante.telefone}</p>
              </div>
            )}
            {votante.empresa && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                <p className="text-sm">{votante.empresa}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {endereco ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                <p className="text-sm">{endereco.logradouro}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número</p>
                <p className="text-sm">{endereco.numero || 'S/N'}</p>
              </div>
              {endereco.complemento && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                  <p className="text-sm">{endereco.complemento}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                <p className="text-sm">{endereco.bairro}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                <p className="text-sm">{endereco.cidade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-sm">{endereco.estado}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CEP</p>
                <p className="text-sm">{formatarCEP(endereco.cep)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Endereço não informado.</p>
          )}
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Documentos Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {arquivos.length > 0 ? (
            <div className="space-y-2">
              {arquivos.map((arq) => (
                <div key={arq.id} className="flex items-center gap-3 p-2 bg-muted rounded-md">
                  <FileText className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{arq.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatarTamanho(arq.tamanho)} • {arq.tipo}</p>
                  </div>
                  <a href={`/api/arquivos/${arq.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Baixar</span>
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
          )}
        </CardContent>
      </Card>

      {/* Ações de status */}
      <StatusActions id={id} initialStatus={votante.status} />
    </div>
  );
}