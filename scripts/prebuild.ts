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

	// Replace the authClient import with the createAuthClient import
	const importPattern: RegExp = /import type \{ authClient \} from '\$lib\/auth-client\.js';/;
	const importReplacement: string = `import type { createAuthClient } from "better-auth/svelte";`;

	if (importPattern.test(content)) {
		content = content.replace(importPattern, importReplacement);
	}

	// Replace the development type with the build type
	const devPattern: RegExp = /export type AnyAuthClient = Omit<typeof authClient, 'signUp' \| 'getSession'>;/;
	const buildReplacement: string = `export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' | 'getSession'>;`;

	if (devPattern.test(content)) {
		content = content.replace(devPattern, buildReplacement);
	} else {
		console.log('ℹ️  AnyAuthClient type already in build mode or pattern not found');
	}

	// Replace the AuthClient type (without Omit)
	const authClientDevPattern: RegExp = /export type AuthClient = typeof authClient;/;
	const authClientBuildReplacement: string = `export type AuthClient = ReturnType<typeof createAuthClient>;`;

	if (authClientDevPattern.test(content)) {
		content = content.replace(authClientDevPattern, authClientBuildReplacement);
	} else {
		console.log('ℹ️  AuthClient type already in build mode or pattern not found');
	}

	writeFileSync(typesFilePath, content, 'utf-8');
	console.log('✅ Successfully updated type definitions for build');
} catch (error) {
	console.error('❌ Error during prebuild:', error);
	process.exit(1);
}
