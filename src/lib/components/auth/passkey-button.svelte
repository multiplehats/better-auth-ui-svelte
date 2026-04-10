<script lang="ts">
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/ui.js';
	import { getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { AuthViewClassNames } from './auth-view.svelte';

	interface Props {
		classNames?: AuthViewClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
	}

	let { classNames, isSubmitting, localization, redirectTo, setIsSubmitting }: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	// Merge context and prop localization (prop takes precedence)
	const loc = $derived({ ...contextLocalization, ...localization });

	const { onSuccess } = useOnSuccessTransition({ redirectTo });

	async function signInPasskey() {
		setIsSubmitting?.(true);

		try {
			const response = await authClient.signIn.passkey({
				fetchOptions: { throw: true }
			});

			if (response?.error) {
				config.toast.error(
					getLocalizedError({
						error: response.error,
						localization: loc
					})
				);

				setIsSubmitting?.(false);
			} else {
				await onSuccess();
			}
		} catch (error) {
			config.toast.error(getLocalizedError({ error, localization: loc }));

			setIsSubmitting?.(false);
		}
	}
</script>

<Button
	class={cn('w-full', classNames?.form?.button, classNames?.form?.secondaryButton)}
	disabled={isSubmitting}
	name="passkey"
	value="true"
	variant="secondary"
	onclick={signInPasskey}
>
	<Fingerprint class={classNames?.form?.icon} />
	{loc.SIGN_IN_WITH}
	{loc.PASSKEY}
</Button>
