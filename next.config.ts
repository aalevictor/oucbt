/** @format */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	output: 'standalone',
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
		optimizePackageImports: ['lucide-react', 'date-fns'],
	},
	allowedDevOrigins: [
		'10.20.4.6',
		'127.0.0.1',
		'192.168.1.10'
	],
};

export default nextConfig;
