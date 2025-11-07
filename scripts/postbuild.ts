#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const typesFilePath: string = join(__dirname, '..', 'src', 'lib', 'types', 'any-auth-client.ts');

console.log('🔄 Running postbuild script...');

try {
	let content: string = readFileSync(typesFilePath, 'utf-8');

	// Restore the authClient import
	const importPattern: RegExp = /import type \{ createAuthClient \} from "better-auth\/svelte";/;
	const importReplacement: string = `import type { authClient } from '$lib/auth-client.js';`;

	if (importPattern.test(content)) {
		content = content.replace(importPattern, importReplacement);
	}

	// Revert back to development type
	const buildPattern: RegExp = /export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' \| 'getSession'>;/;
	const devReplacement: string = `export type AnyAuthClient = Omit<typeof authClient, 'signUp' | 'getSession'>;`;

	if (buildPattern.test(content)) {
		content = content.replace(buildPattern, devReplacement);
	} else {
		console.log('ℹ️  AnyAuthClient type already in development mode or pattern not found');
	}

	// Revert AuthClient type back to development mode (without Omit)
	const authClientBuildPattern: RegExp = /export type AuthClient = ReturnType<typeof createAuthClient>;/;
	const authClientDevReplacement: string = `export type AuthClient = typeof authClient;`;

	if (authClientBuildPattern.test(content)) {
		content = content.replace(authClientBuildPattern, authClientDevReplacement);
	} else {
		console.log('ℹ️  AuthClient type already in development mode or pattern not found');
	}

	writeFileSync(typesFilePath, content, 'utf-8');
	console.log('✅ Successfully reverted type definitions to development mode');
} catch (error) {
	console.error('❌ Error during postbuild:', error);
	process.exit(1);
}
