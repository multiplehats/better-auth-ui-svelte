<script>
	import SignedIn from '$lib/components/signed-in.svelte';
	import UserButton from '$lib/components/user-button.svelte';
</script>

<header class="border-b bg-white dark:bg-gray-800">
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<h1 class="text-xl font-bold">Better Auth UI - Svelte</h1>
		<SignedIn>
			<UserButton />
		</SignedIn>
	</div>
</header>
