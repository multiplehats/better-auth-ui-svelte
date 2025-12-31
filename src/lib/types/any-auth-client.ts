import type { authClient } from '$lib/auth-client';

export type AnyAuthClient = Omit<typeof authClient, 'signUp' | 'getSession'>;

export type AuthClient = typeof authClient;

export type Session = AuthClient['$Infer']['Session']['session'];
export type User = AuthClient['$Infer']['Session']['user'];
