// services/auth.service.ts
import api from './api';
import { tokenService } from './token.service';
import type {
    DoLoginRequest,
    OwnerLoginRequest,
    ResponseLoggedUser,
    ResponseLoggedOwner, MemberRegisterRequest,
} from '../models/user.model';
import type { AuthUser, AuthOwner } from '../models/auth.model';

export const authService = {
  login: async (data: DoLoginRequest): Promise<ResponseLoggedUser> => {
    const response = await api.post<ResponseLoggedUser>('/auth/login', data);
    const responseLoggedUser = response.data;

    tokenService.setTokens(responseLoggedUser.tokens.accessToken, responseLoggedUser.tokens.refreshToken);

    const user: AuthUser = {
        name: responseLoggedUser.name,
        role: responseLoggedUser.role,
        isOwner: false
    };
    tokenService.setUser(user);
    return responseLoggedUser
  },
    registerMember: async (userData: MemberRegisterRequest): Promise<ResponseLoggedUser> => {
        const { data } = await api.post<ResponseLoggedUser>('/auth/register/member', userData);
        tokenService.setTokens(data.tokens.accessToken, data.tokens.refreshToken);

        const user: AuthUser = {
            name: data.name,
            role: data.role,
            isOwner: false
        };

        tokenService.setUser(user);
        return data;
    },
  /** Login de Owner */
  ownerLogin: async (data: OwnerLoginRequest): Promise<ResponseLoggedOwner> => {
    const response = await api.post<ResponseLoggedOwner>('/auth/login/owner', data);
    const responseLoggedOwner = response.data;

    tokenService.setTokens(responseLoggedOwner.tokens.accessToken, null);

    const owner: AuthOwner = {
        name: responseLoggedOwner.name,
        isOwner: true
    };

    tokenService.setUser(owner);
    return responseLoggedOwner
  },

  /** Logout geral */
  logout: (): void => {
    tokenService.clearTokens();
  },

  getAuthUser: (): AuthUser | null => {
      const user = tokenService.getUser();
      return user && !user.isOwner ? user : null;
  },

  getAuthOwner: (): AuthOwner | null => {
      const user = tokenService.getUser();
      return user && user.isOwner ? user : null;
  },

  isAuthenticated: (): boolean => !!tokenService.getAccessToken(),

  isOwner: (): boolean => {
    const user = tokenService.getUser();
    if (!user) return false;
    return user.isOwner;
  },

  getCurrentUser: (): AuthUser | AuthOwner | null => tokenService.getUser(),
};
