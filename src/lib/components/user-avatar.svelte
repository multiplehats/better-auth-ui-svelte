<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import type { User } from '$lib/types';
	import { cn } from '$lib/utils/ui';

	interface Props {
		user?: User | null;
		className?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { user, className, size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-12 w-12'
	};

	// Get user initials
	const initials = $derived(() => {
		if (!user?.name) return '?';
		return user.name
			.split(' ')
			.map((n: string) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	});
</script>

<Avatar.Root class={cn(sizeClasses[size], className)}>
	{#if user?.image}
		<Avatar.Image src={user.image} alt={user.name || user.email} />
	{/if}
	<Avatar.Fallback class="bg-primary/10 text-primary">
		{initials()}
	</Avatar.Fallback>
</Avatar.Root>
