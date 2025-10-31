/** @format */

'use client';

import {
	useState,
	useRef,
	type DragEvent,
	type ChangeEvent,
	forwardRef,
	useImperativeHandle,
} from 'react';
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
	FieldValues,
	UseFormRegisterReturn,
	ControllerRenderProps,
} from 'react-hook-form';
import type React from 'react';
import Image from 'next/image';

export interface FileWithPreview extends File {
	preview?: string;
}

export interface DragDropInputProps {
	label?: string;
	helperText?: string;
	error?: string;
	accept?: string;
	multiple?: boolean;
	maxFiles?: number;
	maxSize?: number; // em bytes, tamanho máximo total de todos os arquivos
	className?: string;
	buttonText?: string;
	dropzoneText?: string;
	disabled?: boolean;
	onChange?: (files: File[]) => void;
	value?: File[];
	register?: UseFormRegisterReturn;
	field?: ControllerRenderProps<FieldValues, string>;
}

export interface DragDropInputRef {
	reset: () => void;
}

const DragDropInput = forwardRef<DragDropInputRef, DragDropInputProps>(
	(
		{
			helperText,
			error,
			accept,
			multiple = true,
			maxFiles,
			maxSize,
			className,
			buttonText = 'Selecionar arquivos',
			dropzoneText = 'Arraste e solte arquivos aqui',
			disabled = false,
			onChange,
			value,
			register,
			field,
		},
		ref,
	) => {
		const [files, setFiles] = useState<FileWithPreview[]>(value || []);
		const [isDragging, setIsDragging] = useState(false);
		const fileInputRef = useRef<HTMLInputElement>(null);

		// Referência interna para o input que será usada com register
		// const internalInputRef = useRef<HTMLInputElement>(null);

		// Expõe métodos para o componente pai
		useImperativeHandle(ref, () => ({
			reset: () => {
				setFiles([]);
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			},
		}));

		const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (!disabled) setIsDragging(true);
		};

		const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
		};

		const handleDrop = (e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			if (disabled) return;

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				handleFiles(e.dataTransfer.files);
			}
		};

		const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
			if (disabled) return;

			if (e.target.files && e.target.files.length > 0) {
				handleFiles(e.target.files);
			}
		};

		const handleFiles = (fileList: FileList) => {
			let newFiles = Array.from(fileList);

			// Limitar número de arquivos
			if (maxFiles && files.length + newFiles.length > maxFiles) {
				newFiles = newFiles.slice(0, maxFiles - files.length);
			}

			// Verificar tamanho total da coleção
			if (maxSize) {
				// Calcular tamanho atual dos arquivos
				const currentSize = files.reduce((total, file) => total + file.size, 0);

				// Verificar se os novos arquivos excedem o limite
				let totalNewSize = 0;
				const validFiles = [];

				for (const file of newFiles) {
					if (currentSize + totalNewSize + file.size <= maxSize) {
						validFiles.push(file);
						totalNewSize += file.size;
					} else {
						// Parar de adicionar arquivos quando o limite for atingido
						break;
					}
				}

				newFiles = validFiles;
			}

			// Criar previews para imagens
			const filesWithPreview = newFiles.map((file) => {
				if (file.type.startsWith('image/')) {
					return Object.assign(file, {
						preview: URL.createObjectURL(file),
					});
				}
				return file;
			});

			const updatedFiles = multiple
				? [...files, ...filesWithPreview]
				: filesWithPreview;

			setFiles(updatedFiles);

			// Notificar react-hook-form sobre a mudança
			if (field) {
				field.onChange(updatedFiles);
			}

			// Chamar callback personalizado se fornecido
			if (onChange) {
				onChange(updatedFiles);
			}
		};

		const removeFile = (index: number) => {
			if (disabled) return;

			// Primeiro, vamos revogar a URL do objeto se necessário
			if (files[index]?.preview) {
				URL.revokeObjectURL(files[index].preview!);
			}

			// Agora, vamos criar uma nova lista de arquivos sem o arquivo removido
			const newFiles = [...files];
			newFiles.splice(index, 1);

			// Atualizar o estado com a nova lista
			setFiles(newFiles);

			// Notificar react-hook-form sobre a mudança
			if (field) {
				field.onChange(newFiles);
			}

			// Chamar callback personalizado se fornecido
			if (onChange) {
				onChange(newFiles);
			}
		};

		const formatFileSize = (bytes: number): string => {
			if (bytes < 1024) return bytes + ' B';
			else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
			else if (bytes < 1024 * 1024 * 1024)
				return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
			else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
		};

		const openFileDialog = () => {
			if (!disabled && fileInputRef.current) {
				fileInputRef.current.click();
			}
		};

		// Preparar props para o input
		let inputProps: React.InputHTMLAttributes<HTMLInputElement> & {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			ref?: any;
		} = {
			type: 'file',
			className: 'hidden',
			multiple: multiple,
			accept: accept,
			disabled: disabled,
			onChange: handleFileChange,
			ref: fileInputRef,
		};

		// Se register for fornecido, usamos uma abordagem diferente
		if (register) {
			const { ref: registerRef, ...registerRest } = register;

			inputProps = {
				...inputProps,
				...registerRest,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					register.onChange(e);
					handleFileChange(e);
				},
				// Usamos o ref do register diretamente
				ref: registerRef,
			};
		}

		return (
			<div className={cn('w-full', className)}>
				<div
					className={cn(
						'relative border-2 border-dashed rounded-lg p-6 transition-colors',
						isDragging
							? 'border-primary bg-primary/5'
							: 'border-gray-300 dark:border-gray-700 hover:border-primary',
						disabled &&
							'opacity-60 cursor-not-allowed border-gray-200 hover:border-gray-200',
						error && 'border-red-500 hover:border-red-500',
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={disabled ? undefined : openFileDialog}>
					<input {...inputProps} />

					<div className='flex flex-col items-center justify-center text-center'>
						<Upload className='h-10 w-10 text-gray-400 mb-3' />
						<h3 className='text-sm font-medium mb-1'>{dropzoneText}</h3>
						<p className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
							ou clique para selecionar
						</p>
						<Button
							type='button'
							variant='outline'
							size='sm'
							disabled={disabled}
							onClick={(e: { stopPropagation: () => void; }) => {
								e.stopPropagation();
								openFileDialog();
							}}>
							{buttonText}
						</Button>
					</div>
				</div>

				{helperText && !error && (
					<p className='mt-1.5 text-xs text-gray-500'>{helperText}</p>
				)}

				{error && (
					<p className='mt-1.5 text-xs text-red-500 flex items-center'>
						<AlertCircle className='h-3 w-3 mr-1' />
						{error}
					</p>
				)}

				{files.length > 0 && (
					<div className='mt-4'>
						<div className='flex justify-between items-center mb-2'>
							<h4 className='text-xs font-medium'>
								Arquivos selecionados ({files.length}/{maxFiles})
							</h4>
							{maxSize && (
								<span className='text-xs text-gray-500'>
									{formatFileSize(
										files.reduce((total, file) => total + file.size, 0),
									)}
									{' / '}
									{formatFileSize(maxSize)}
								</span>
							)}
						</div>
						<ul className='space-y-2'>
							{files.map((file, index) => (
								<li
									key={`${file.name}-${index}`}
									className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md'>
									<div className='flex items-center'>
										{file.preview ? (
											<Image
												src={file.preview || '/placeholder.svg'}
												alt={file.name}
												className='w-8 h-8 object-cover rounded-md mr-2'
											/>
										) : (
											<FileIcon className='w-8 h-8 p-1.5 mr-2 text-gray-500' />
										)}
										<div>
											<p className='text-xs font-medium break-all sm:break-words whitespace-normal max-w-[150px] sm:max-w-xs'>
												{file.name}
											</p>
											<p className='text-xs text-gray-500'>
												{formatFileSize(file.size)}
											</p>
										</div>
									</div>
									<Button
										variant='ghost'
										size='icon'
										disabled={disabled}
										onClick={(e: { stopPropagation: () => void; }) => {
											e.stopPropagation();
											removeFile(index);
										}}
										className='h-6 w-6 text-gray-500 hover:text-red-500'>
										<X className='h-3 w-3' />
										<span className='sr-only'>Remover arquivo</span>
									</Button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	},
);

DragDropInput.displayName = 'DragDropInput';

export default DragDropInput;
