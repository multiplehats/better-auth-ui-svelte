<script lang="ts">
	import { useAuthenticate } from '$lib/hooks/use-authenticate.svelte.js';

	/**
	 * Redirects the user to the sign-up page
	 *
	 * Renders nothing and automatically redirects the current user to the authentication
	 * sign-up page. Useful for directing new users to create an account or
	 * for redirecting from marketing pages to the registration flow.
	 */
	useAuthenticate({ authView: 'SIGN_UP' });
</script>
