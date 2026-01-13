import type { ReactNode } from 'react';
import { UserRole } from './enums';
import type {
    DoLoginRequest,
    OwnerLoginRequest,
    ResponseLoggedUser,
    ResponseLoggedOwner, MemberRegisterRequest,
} from './user.model';

/* =========================
   Auth Models
========================= */
export interface AuthUser {
    name: string;
    role: UserRole;
    readonly isOwner: false;
}

export interface AuthOwner {
    name: string;
    readonly isOwner: true;
}
export type AuthenticatedUser = AuthUser | AuthOwner;

export const isOwner = (user: AuthenticatedUser | null): user is AuthOwner =>
    !!user && user.isOwner;

export const isMember = (user: AuthenticatedUser | null): user is AuthUser =>
    !!user && !user.isOwner && user.role === UserRole.MEMBRO;

export const isAdmin = (user: AuthenticatedUser | null): user is AuthUser =>
    !!user && !user.isOwner && user.role === UserRole.ADMINISTRADOR;

/* =========================
   Context Value
========================= */
export interface AuthContextValue {
    user: AuthUser | AuthOwner | null;
    loading: boolean;

    login: (credentials: DoLoginRequest) => Promise<ResponseLoggedUser>;
    ownerLogin: (credentials: OwnerLoginRequest) => Promise<ResponseLoggedOwner>;
    memberRegister: (credentials: MemberRegisterRequest) => Promise<ResponseLoggedUser>;
    logout: () => void;

    isAuthenticated: boolean;
    isOwner: boolean;
    isAdmin: boolean;
    isMember: boolean;
}

/* =========================
   Provider Props
========================= */
export interface AuthProviderProps {
    children: ReactNode;
}
