import type { createAuthClient } from 'better-auth/svelte';

export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, 'signUp' | 'getSession'>;

export type AuthClient = ReturnType<typeof createAuthClient>;

export type Session = AuthClient['$Infer']['Session']['session'];
export type User = AuthClient['$Infer']['Session']['user'];
