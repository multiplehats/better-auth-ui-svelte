import type { authClient } from '$lib/auth-client.js';

/**
 * Type swapping via prebuild/postbuild scripts:
 * - DEV: Uses `typeof authClient` for accurate plugin types from our specific Better Auth config
 * - BUILD: Uses `ReturnType<typeof createAuthClient>` for generic types, since consumers
 *   may have different plugin configurations than our development instance
 *
 * This ensures proper type-checking during development while maintaining compatibility
 * for library consumers with varying Better Auth plugin configurations.
 */
// export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' | 'getSession'>;
export type AnyAuthClient = Omit<typeof authClient, 'signUp' | 'getSession'>;

export type AuthClient = typeof authClient;
