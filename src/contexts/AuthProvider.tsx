import {useState} from 'react';
import {
    type AuthContextValue,
    type AuthOwner,
    type AuthProviderProps,
    type AuthUser, isAdmin, isMember,
    isOwner,
} from '../models/auth.model';
import type {
    DoLoginRequest,
    MemberRegisterRequest,
    OwnerLoginRequest,
    ResponseLoggedOwner,
    ResponseLoggedUser,
} from '../models/user.model';
import {authService} from '../services/auth.service';
import { AuthContext } from "./AuthContext.ts";

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | AuthOwner | null>(() =>
        authService.getCurrentUser()
    );

    const login = async (
        credentials: DoLoginRequest
    ): Promise<ResponseLoggedUser> => {
        const result = await authService.login(credentials);
        setUser(authService.getCurrentUser());
        return result;
    };

    const memberRegister = async (
        credentials: MemberRegisterRequest
    ): Promise<ResponseLoggedUser> => {
        const result = await authService.registerMember(credentials);
        setUser(authService.getCurrentUser());
        return result;
    };

    const ownerLogin = async (
        credentials: OwnerLoginRequest
    ): Promise<ResponseLoggedOwner> => {
        const result = await authService.ownerLogin(credentials);
        setUser(authService.getCurrentUser());
        return result;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        loading: false,

        login,
        ownerLogin,
        memberRegister,
        logout,

        isAuthenticated: !!user,
        isOwner: isOwner(user),
        isAdmin: isAdmin(user),
        isMember: isMember(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
