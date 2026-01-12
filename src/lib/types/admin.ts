import type { PaginationState } from '@tanstack/table-core';
import type { AuthLocalization } from './index.js';
import type { AdminViewPath } from '$lib/utils/view-paths.js';

/**
 * Better Auth User with admin plugin fields
 */
export interface User {
	id: string;
	email: string;
	name?: string | null;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date | string | null;
	updatedAt: Date | string | null;
}

/**
 * User with role from Better Auth admin plugin
 */
export interface UserWithRole extends User {
	role: string;
	banned?: boolean;
	banReason?: string | null;
	banExpires?: Date | string | null;
}

/**
 * User session information
 */
export interface UserSession {
	id: string;
	userId: string;
	expiresAt: Date | string | null;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: Date | string | null;
}

/**
 * Organization from Better Auth organization plugin
 */
export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	createdAt: Date | string | null;
	metadata?: Record<string, unknown> | null;
}

/**
 * Organization member
 */
export interface OrganizationMember {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: Date | string | null;
	user: User;
}

/**
 * Organization with members
 */
export interface OrganizationWithMembers extends Organization {
	members: OrganizationMember[];
}

/**
 * Organization invitation
 */
export interface OrganizationInvitation {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: 'pending' | 'accepted' | 'rejected';
	expiresAt: Date | string | null;
	inviterId: string;
	createdAt: Date | string | null;
}

/**
 * Custom action for admin table dropdown menus
 */
export interface AdminTableAction<T> {
	/** Display label for the action */
	label: string;
	/** Optional Lucide icon component */
	icon?: typeof import('@lucide/svelte').Icon;
	/** Click handler receiving the item */
	onClick: (item: T) => void | Promise<void>;
	/** Optional variant for styling (e.g., 'destructive') */
	variant?: 'default' | 'destructive';
	/** Optional condition to show/hide the action */
	show?: (item: T) => boolean;
}

/**
 * Props for users admin table
 */
export interface UsersAdminTableProps {
	data: UserWithRole[];
	pageCount: number;
	pagination: PaginationState;
	onPaginationChange: (updater: PaginationState | ((state: PaginationState) => PaginationState)) => void;
	isLoading: boolean;
	onImpersonate?: (userId: string) => void | Promise<void>;
	onBanUser?: (userId: string, reason?: string, expiresAt?: Date) => void | Promise<void>;
	onUnbanUser?: (userId: string) => void | Promise<void>;
	onUpdateRole?: (userId: string, role: string) => void | Promise<void>;
	onDeleteUser?: (userId: string) => void | Promise<void>;
	onResetPassword?: (userId: string) => void | Promise<void>;
	onRevokeSessions?: (userId: string) => void | Promise<void>;
}

/**
 * Props for organizations admin table
 */
export interface OrganizationsAdminTableProps {
	data: Organization[];
	pageCount: number;
	pagination: PaginationState;
	onPaginationChange: (updater: PaginationState | ((state: PaginationState) => PaginationState)) => void;
	isLoading: boolean;
	onViewMembers?: (organizationId: string) => void | Promise<void>;
	onImpersonateMember?: (organizationId: string) => void | Promise<void>;
	onUpdateOrganization?: (organizationId: string, data: Partial<Organization>) => void | Promise<void>;
	onDeleteOrganization?: (organizationId: string) => void | Promise<void>;
}

/**
 * Props for organization members detail dialog
 */
export interface OrganizationMembersDetailProps {
	organizationId: string;
	organizationName: string;
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	onImpersonate?: (userId: string) => void | Promise<void>;
	onUpdateMemberRole?: (userId: string, role: string) => void | Promise<void>;
	onRemoveMember?: (userId: string) => void | Promise<void>;
}

/**
 * Props for ban user dialog
 */
export interface BanUserDialogProps {
	open: boolean;
	user: UserWithRole | null;
	onBan: (reason?: string, expiresAt?: Date) => void | Promise<void>;
	onCancel: () => void;
}

/**
 * Props for update role dialog
 */
export interface UpdateRoleDialogProps {
	open: boolean;
	user: UserWithRole | null;
	currentRole: string;
	roles: string[];
	onUpdate: (role: string) => void | Promise<void>;
	onCancel: () => void;
}

/**
 * Props for impersonate user dialog
 */
export interface ImpersonateUserDialogProps {
	open: boolean;
	user: UserWithRole | null;
	onImpersonate: () => void | Promise<void>;
	onCancel: () => void;
}

/**
 * Props for admin view component
 */
export interface AdminViewProps {
	className?: string;
	classNames?: {
		base?: string;
		tabs?: { root?: string; list?: string; trigger?: string };
	};
	localization?: Partial<AuthLocalization>;
	path?: string;
	pathname?: string;
	view?: AdminViewPath;
	hideNav?: boolean;
}
