import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
import type { AuthViewPath } from '$lib/utils/view-paths.js';
import type { AnyAuthClient } from '$lib/types/any-auth-client.js';
import { browser } from '$app/environment';
import { fromStore } from '$lib/utils/store-to-rune.svelte.js';
import { SvelteURL } from 'svelte/reactivity';

interface AuthenticateOptions<TAuthClient extends AnyAuthClient> {
	authClient?: TAuthClient;
	authView?: AuthViewPath;
	enabled?: boolean;
}

/**
 * Hook that redirects to authentication view if user is not authenticated.
 * This hook bridges better-auth's nanostores with Svelte 5's rune-based reactivity.
 *
 * IMPORTANT: Must be called during component initialization for proper reactivity.
 *
 * @example
 * ```svelte
 * <script>
 *   const auth = useAuthenticate({ authView: 'SIGN_IN' });
 * </script>
 *
 * {#if auth.isPending}
 *   Loading...
 * {:else if auth.data}
 *   <h1>Welcome {auth.user.name}</h1>
 * {/if}
 * ```
 */
export function useAuthenticate<TAuthClient extends AnyAuthClient>(
	options?: AuthenticateOptions<TAuthClient>
) {
	type Session = TAuthClient['$Infer']['Session']['session'];
	type User = TAuthClient['$Infer']['Session']['user'];

	const { authView = 'SIGN_IN', enabled = true } = options ?? {};

	const { hooks, basePath, viewPaths, replace } = getAuthUIConfig();

	const sessionStore = hooks.useSession();
	const session = fromStore(sessionStore);

	const sessionData = $derived.by(() => {
		const result = session.value;
		return result && 'data' in result
			? (result.data as
					| {
							session: Session;
							user: User;
					  }
					| null
					| undefined)
			: null;
	});

	const isPending = $derived.by(() => {
		const result = session.value;
		return result && 'isPending' in result ? result.isPending : false;
	});

	const error = $derived.by(() => {
		const result = session.value;
		return result && 'error' in result ? result.error : undefined;
	});

	const refetch = $derived.by(() => {
		const result = session.value;
		return result && 'refetch' in result ? result.refetch : undefined;
	});

	// Redirect to auth if not authenticated
	$effect(() => {
		if (!browser || !enabled || isPending || sessionData) return;

		const currentUrl = new SvelteURL(window.location.href);
		const redirectTo =
			currentUrl.searchParams.get('redirectTo') ||
			window.location.href.replace(window.location.origin, '');

		replace(`${basePath}/${viewPaths[authView]}?redirectTo=${encodeURIComponent(redirectTo)}`);
	});

	return {
		get data() {
			return sessionData;
		},
		get user() {
			return sessionData?.user;
		},
		get isPending() {
			return isPending;
		},
		get error() {
			return error;
		},
		get refetch() {
			return refetch;
		}
	};
}
