// This will need to be defined or imported from a social-providers utility
export type Provider = {
	provider: string;
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon?: any; // Svelte component type - dynamic import
};

export type GenericOAuthOptions = {
	/**
	 * Custom OAuth Providers
	 * @default []
	 */
	providers: Provider[];
	/**
	 * Custom generic OAuth sign in function
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	signIn?: (params: any) => Promise<unknown>;
};
