<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAuthPath } from '$lib/index.js';
	import { authPathConfig, DEFAULT_AUTH_REDIRECT } from '$lib/config/auth-config.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const signInPath = getAuthPath('SIGN_IN', authPathConfig);
	const signUpPath = getAuthPath('SIGN_UP', authPathConfig);
</script>

<header class="border-b bg-background">
	<nav class="container mx-auto flex h-16 items-center justify-between px-4">
		<div class="flex items-center gap-8">
			<a href="/" class="flex items-center gap-2">
				<svg
					class="h-8 w-8 text-primary"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
				<span class="text-xl font-bold">Better Auth UI</span>
			</a>

			<div class="hidden items-center gap-6 md:flex">
				<a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground">
					Features
				</a>
				<a href="#docs" class="text-sm font-medium text-muted-foreground hover:text-foreground">
					Documentation
				</a>
				<a
					href="https://github.com/daveyplate/better-auth-ui"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm font-medium text-muted-foreground hover:text-foreground"
				>
					GitHub
				</a>
			</div>
		</div>

		<div class="flex items-center gap-3">
			{#if data.isAuthenticated}
				<Button href={DEFAULT_AUTH_REDIRECT}>Go to App</Button>
			{:else}
				<Button variant="ghost" href={signInPath} class="hidden sm:inline-flex">Log in</Button>
				<Button href={signUpPath}>Get Started</Button>
			{/if}
		</div>
	</nav>
</header>

<!-- Hero Section -->
<main class="flex-1">
	<section class="container mx-auto px-4 py-24 sm:py-32">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-4 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
				<span class="text-primary">🎉</span>
				<span class="ml-2 text-muted-foreground">Built with Svelte 5 & Better Auth</span>
			</div>

			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
				Beautiful Authentication UI for
				<span class="text-primary">Svelte</span>
			</h1>

			<p class="mb-8 text-lg text-muted-foreground sm:text-xl">
				Pre-built, customizable authentication components for Better Auth. Drop-in ready forms for
				sign in, sign up, password reset, and more. Fully styled with Tailwind CSS and
				shadcn-svelte.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button
					size="lg"
					href={data.isAuthenticated ? DEFAULT_AUTH_REDIRECT : signUpPath}
					class="w-full sm:w-auto"
				>
					{data.isAuthenticated ? 'Go to App' : 'Try Live Demo'}
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</Button>
				<Button size="lg" variant="outline" href="#features" class="w-full sm:w-auto">
					View Features
				</Button>
			</div>

			<!-- Feature highlights -->
			<div class="mt-16 grid gap-8 sm:grid-cols-3">
				<div class="text-center">
					<div class="mb-3 text-3xl">🚀</div>
					<h3 class="mb-2 font-semibold">Svelte 5 Runes</h3>
					<p class="text-sm text-muted-foreground">
						Built with the latest Svelte 5 reactive primitives
					</p>
				</div>
				<div class="text-center">
					<div class="mb-3 text-3xl">🎨</div>
					<h3 class="mb-2 font-semibold">Fully Customizable</h3>
					<p class="text-sm text-muted-foreground">Styled with Tailwind CSS v4 and shadcn-svelte</p>
				</div>
				<div class="text-center">
					<div class="mb-3 text-3xl">🔐</div>
					<h3 class="mb-2 font-semibold">Better Auth</h3>
					<p class="text-sm text-muted-foreground">
						Native integration with Better Auth's Svelte client
					</p>
				</div>
			</div>
		</div>
	</section>
</main>
