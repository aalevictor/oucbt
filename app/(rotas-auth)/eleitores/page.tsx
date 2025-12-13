/** @format */

import DataTable, { TableSkeleton } from '@/components/data-table';
import { Filtros } from '@/components/filtros';
import Pagination from '@/components/pagination';
import { auth } from '@/auth';
import { Suspense } from 'react';
import { columns } from './_components/columns';
import { buscarVotantes, IVotante, IVotantePaginado } from '@/services/votantes';
import { Button } from '@/components/ui/button';

export default async function UsuariosSuspense({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return (
		<Suspense fallback={<TableSkeleton />}>
			<Eleitores searchParams={searchParams} />
		</Suspense>
	);
}

async function Eleitores({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	let { pagina = 1, limite = 10, total = 0 } = await searchParams;
	const { busca = '', status = '' } = await searchParams;
	let dados: IVotante[] = [];

	const session = await auth();
	if (session) {
		const response = await buscarVotantes(
			+pagina,
			+limite,
			busca as string,
			status as string,
		);
		if (response) {
			const paginado = response as IVotantePaginado;
			pagina = paginado.pagina || 1;
			limite = paginado.limite || 10;
			total = paginado.total || 0;
			dados = paginado.data || [];
		}
	}

	const statusSelect = [
		{
			label: 'Em análise',
			value: 'EM_ANALISE',
		},
		{
			label: 'Deferido',
			value: 'DEFERIDO',
		},
		{
			label: 'Indeferido',
			value: 'INDEFERIDO',
		},
	];

	return (
		<div className='  px-0 md:px-8 relative pb-20 md:pb-14 h-full container mx-auto '>
			<h1 className='text-xl md:text-4xl font-bold'>Eleitores</h1>
			<div className='grid grid-cols-1  gap-y-3 my-5 '>
				<Filtros
					camposFiltraveis={[
						{
							nome: 'Busca',
							tag: 'busca',
							tipo: 0,
							placeholder: 'Digite o nome ou email',
						},
						{
							nome: 'Status',
							tag: 'status',
							tipo: 2,
							valores: statusSelect,
							default: 'all',
						},
					]}
				/>

				<div className='flex justify-end'>
					<Button asChild>
						<a
							href='/api/votantes/export'
							download
							className='inline-flex items-center gap-2'
						>
							Exportar DEFERIDOS (.txt)
						</a>
					</Button>
				</div>
				<div className='w-full'>
					<DataTable
						columns={columns}
						data={dados || []}
					/>
				</div>

				{dados && dados.length > 0 && (
					<Pagination
						total={+total}
						pagina={+pagina}
						limite={+limite}
					/>
				)}
			</div>
		</div>
	);
}
