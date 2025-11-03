/** @format */

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { IVotante } from '@/services/votantes';
import { Votante } from '@prisma/client';

export const columns: ColumnDef<IVotante>[] = [
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
			const dataNascimento = new Date(row.original.dataNascimento);
			const idade = Math.floor((Date.now() - dataNascimento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
			const formatada = new Date(row.original.dataNascimento).toISOString().split('T')[0].split('-').reverse().join('/');
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
