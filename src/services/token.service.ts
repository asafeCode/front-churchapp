// services/token.service.ts
import type {AuthOwner, AuthUser} from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'treasury_access_token';
const REFRESH_TOKEN_KEY = 'treasury_refresh_token';
const USER_KEY = 'treasury_user';

export const tokenService = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken: string | null): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken !== null) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): AuthUser | AuthOwner | null => {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;

    return JSON.parse(user) as AuthUser | AuthOwner;
  },

  setUser: (user: AuthUser | AuthOwner): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};
