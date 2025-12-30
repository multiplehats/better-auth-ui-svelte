<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';
	import type { SettingsCardClassNames } from './settings-card.svelte';

	export interface SessionFreshnessDialogProps {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		title?: string;
		description?: string;
	}

	type Props = SessionFreshnessDialogProps;

	let {
		open = false,
		onOpenChange,
		classNames,
		localization: propLocalization,
		title,
		description
	}: Props = $props();

	const { basePath, localization: contextLocalization, viewPaths, navigate } = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const handleSignOut = () => {
		navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
		onOpenChange?.(false);
	};
</script>

<Dialog {open} {onOpenChange}>
	<DialogContent class={cn('sm:max-w-md', classNames?.dialog?.content)}>
		<DialogHeader class={classNames?.dialog?.header}>
			<DialogTitle class={cn('text-lg md:text-xl', classNames?.title)}>
				{title || mergedLocalization.SESSION_EXPIRED || 'Session Expired'}
			</DialogTitle>

			<DialogDescription class={cn('text-xs md:text-sm', classNames?.description)}>
				{description || mergedLocalization.SESSION_NOT_FRESH}
			</DialogDescription>
		</DialogHeader>

		<DialogFooter class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="secondary"
				class={cn(classNames?.button, classNames?.secondaryButton)}
				onclick={() => onOpenChange?.(false)}
			>
				{mergedLocalization.CANCEL}
			</Button>

			<Button
				class={cn(classNames?.button, classNames?.primaryButton)}
				variant="default"
				onclick={handleSignOut}
			>
				{mergedLocalization.SIGN_OUT}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
