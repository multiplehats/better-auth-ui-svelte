import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
import type { AuthLocalization } from '$lib/types/index.js';

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = ['/sign-up/email', '/sign-in/email', '/forget-password'];

// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
	// First remove leading slash if present
	let result = action.startsWith('/') ? action.substring(1) : action;

	// Convert both kebab-case and path separators to camelCase
	// Example: "/sign-in/email" becomes "signInEmail"
	result = result
		.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
		.replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase())
		.replace(/\//g, '')
		.replace(/[^A-Za-z0-9_]/g, '');

	return result;
};

export function useCaptcha({
	localization: propLocalization
}: {
	localization?: Partial<AuthLocalization>;
} = {}) {
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const captcha = config.captcha;

	const localization = { ...contextLocalization, ...propLocalization };

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let captchaRef = $state<any>(null);

	const executeCaptcha = async (action: string): Promise<string> => {
		if (!captcha) throw new Error(localization.MISSING_RESPONSE);

		let response: string | undefined | null;

		switch (captcha.provider) {
			case 'google-recaptcha-v3': {
				// For v3, we would need to integrate with the recaptcha script
				// This requires window.grecaptcha to be available
				const sanitizedAction = sanitizeActionName(action);
				if (
					typeof window !== 'undefined' &&
					(
						window as unknown as {
							grecaptcha?: {
								execute: (siteKey: string, params: { action: string }) => Promise<string>;
							};
						}
					).grecaptcha
				) {
					response = await (
						window as unknown as {
							grecaptcha: {
								execute: (siteKey: string, params: { action: string }) => Promise<string>;
							};
						}
					).grecaptcha.execute(captcha.siteKey, {
						action: sanitizedAction
					});
				}
				break;
			}
			case 'google-recaptcha-v2-checkbox': {
				response = captchaRef?.getValue?.();
				break;
			}
			case 'google-recaptcha-v2-invisible': {
				response = await captchaRef?.executeAsync?.();
				break;
			}
			case 'cloudflare-turnstile': {
				response = captchaRef?.getResponse?.();
				break;
			}
			case 'hcaptcha': {
				response = captchaRef?.getResponse?.();
				break;
			}
		}

		if (!response) {
			throw new Error(localization.MISSING_RESPONSE);
		}

		return response;
	};

	const getCaptchaHeaders = async (action: string): Promise<Record<string, string> | undefined> => {
		if (!captcha) return undefined;

		// Use custom endpoints if provided, otherwise use defaults
		const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS;

		// Only execute captcha if the action is in the endpoints list
		if (endpoints.includes(action)) {
			return { 'x-captcha-response': await executeCaptcha(action) };
		}

		return undefined;
	};

	const resetCaptcha = () => {
		if (!captcha) return;

		switch (captcha.provider) {
			case 'google-recaptcha-v3': {
				// No widget to reset; token is generated per execute call
				break;
			}
			case 'google-recaptcha-v2-checkbox':
			case 'google-recaptcha-v2-invisible': {
				captchaRef?.reset?.();
				break;
			}
			case 'cloudflare-turnstile': {
				captchaRef?.reset?.();
				break;
			}
			case 'hcaptcha': {
				captchaRef?.resetCaptcha?.();
				break;
			}
		}
	};

	return {
		get captchaRef() {
			return captchaRef;
		},
		set captchaRef(value) {
			captchaRef = value;
		},
		getCaptchaHeaders,
		resetCaptcha
	};
}
