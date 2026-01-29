import type { authClient } from '$lib/auth-client';

export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' | 'getSession'>;

export type AuthClient = ReturnType<typeof createAuthClient>;

export type Session = AuthClient['$Infer']['Session']['session'];
export type User = AuthClient['$Infer']['Session']['user'];
