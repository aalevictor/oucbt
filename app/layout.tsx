/** @format */

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'OUCBT - Operação Urbana Consorciada Bairros do Tamanduateí',
	description: 'Operação Urbana Consorciada Bairros do Tamanduateí',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='pt-BR'
			suppressHydrationWarning
			className={`${openSans.className} antialiased`}>
			<body>
				<AuthProvider>
					<QueryProvider>
						<ThemeProvider
							attribute='class'
							defaultTheme='light'
							enableSystem
							disableTransitionOnChange>
							{children}
							<Toaster richColors />
						</ThemeProvider>
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
