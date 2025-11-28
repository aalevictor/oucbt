/** @format */

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { IVotante } from '@/services/votantes';
import { Votante } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from '@/components/link';

export const columns: ColumnDef<IVotante>[] = [
	{
		accessorKey: 'acoes',
		header: '',
		cell: ({ row }) => {
			return (
				<div className='flex items-center gap-2'>
					<Link href={`/eleitores/${row.original.id}`} className='text-sm font-medium text-muted-foreground'>
						<Eye className='w-4 h-4' />
					</Link>
				</div>
			);
		},
	},
	{
		accessorKey: 'tipoInscricao',
		header: '',
		cell: ({ row }) => {
			const tipoInscricao = row.original.tipoInscricao;
			const badgeStatus: Record<
				Votante['status'],
				{ variant: "default" | "success" | "destructive" | "secondary" | "outline" | null | undefined; text: string }
			> = {
				DEFERIDO: {
					variant: 'success',
					text: 'Deferido',
				},
				INDEFERIDO: {
					variant: 'destructive',
					text: 'Indeferido',
				},
				EM_ANALISE: {
					variant: 'default',
					text: 'Em Análise',
				}
			}
			const status = row.original.status;
			return (
				<div className='flex items-center gap-2'>
					<Badge className='capitalize' variant={tipoInscricao === 'MORADOR' ? 'success' : 'default'}>
						{tipoInscricao === 'MORADOR' ? 'Morador' : 'Trabalhador'}
					</Badge>
					<Badge className='capitalize' variant={badgeStatus[status].variant}>
						{badgeStatus[status].text}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: 'nome',
		header: 'Nome',
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
	{
		accessorKey: 'dataNascimento',
		header: 'Dt. Nascimento',
		cell: ({ row }) => {
			const raw = row.original.dataNascimento;
			const isoDate = new Date(raw as Date | string).toISOString().slice(0, 10);
			const [anoStr, mesStr, diaStr] = isoDate.split('-');
			const ano = Number(anoStr), mes = Number(mesStr), dia = Number(diaStr);
			const hoje = new Date();
			let idade = hoje.getFullYear() - ano;
			const mesDiff = hoje.getMonth() - (mes - 1);
			if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < dia)) idade--;
			const formatada = `${diaStr}/${mesStr}/${anoStr}`;
			return `${formatada} (${idade} anos)`;
		},
	},
	{
		accessorKey: 'endereco',
		header: 'Endereco',
		cell: ({ row }) => {
			const endereco = row.original.endereco;
			if (!endereco) {
				return '-';
			}
			return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`;
		},
	},
	{
		accessorKey: 'arquivos',
		header: 'Arquivos enviados',
		cell: ({ row }) => {
			const arquivos = row.original.arquivos?.length || 0;
			return <Badge>
				{arquivos} arquivo(s)
			</Badge>
		},
	},
];
