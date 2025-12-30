import type { BetterFetchError } from '@better-fetch/fetch';
import type { Account, User } from 'better-auth';
import type { Member } from 'better-auth/plugins/organization';
import type { AnyAuthClient } from './any-auth-client.js';
import type { ApiKey } from './api-key.js';
import type { Invitation } from './invitation.js';
import type { Refetch } from './refetch.js';

type AnyAuthSession = AnyAuthClient['$Infer']['Session'];

type AuthHook<T> = {
	isPending: boolean;
	data?: T | null;
	error?: BetterFetchError | null;
	refetch?: Refetch;
};

export type AuthHooks = {
	useSession: () => ReturnType<AnyAuthClient['useSession']>;
	useListAccounts: () => AuthHook<Account[]>;
	useAccountInfo: (params: { providerId: string }) => AuthHook<{ user: User }>;
	useListDeviceSessions: () => AuthHook<AnyAuthClient['$Infer']['Session'][]>;
	useListSessions: () => AuthHook<AnyAuthSession['session'][]>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useListPasskeys: () => any;
	useListApiKeys: () => AuthHook<ApiKey[]>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useActiveOrganization: () => any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useListOrganizations: () => any;
	useHasPermission: (params: { permission: string }) => AuthHook<{
		error: null;
		success: boolean;
	}>;
	useInvitation: (params: { id: string }) => AuthHook<
		Invitation & {
			organizationName: string;
			organizationSlug: string;
			organizationLogo?: string;
		}
	>;
	useListInvitations: (params: { query?: { organizationId?: string } }) => AuthHook<Invitation[]>;
	useListUserInvitations: () => AuthHook<Invitation[]>;
	useListMembers: (params: { query?: { organizationId?: string } }) => AuthHook<{
		members: (Member & { user?: Partial<User> | null })[];
		total: number;
	}>;
	useIsRestoring?: () => boolean;
};
