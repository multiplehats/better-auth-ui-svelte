#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const typesFilePath: string = join(__dirname, '..', 'src', 'lib', 'types', 'any-auth-client.ts');

console.log('🔄 Running prebuild script...');

try {
	let content: string = readFileSync(typesFilePath, 'utf-8');

	// Comment out the authClient import
	const importPattern: RegExp = /import type \{ authClient \} from '\$lib\/auth-client\.js';/;
	const importReplacement: string = `// import type { authClient } from '$lib/auth-client.js';`;

	if (importPattern.test(content)) {
		content = content.replace(importPattern, importReplacement);
	}

	// Replace the development type with the build type
	const devPattern: RegExp =
		/\/\*\*\n \* Type swapping via prebuild\/postbuild scripts:[\s\S]*?\*\/\n\/\/ export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' \| 'getSession'>;\nexport type AnyAuthClient = Omit<typeof authClient, 'signUp' \| 'getSession'>;/;

	const buildReplacement: string = `export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' | 'getSession'>;\n// export type AnyAuthClient = Omit<typeof authClient, 'signUp' | 'getSession'>;`;

	if (devPattern.test(content)) {
		content = content.replace(devPattern, buildReplacement);
		writeFileSync(typesFilePath, content, 'utf-8');
		console.log('✅ Successfully updated type definitions for build');
	} else {
		console.log('ℹ️  Type definitions already in build mode or pattern not found');
	}
} catch (error) {
	console.error('❌ Error during prebuild:', error);
	process.exit(1);
}
