import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios';
import {tokenService} from './token.service';
import {authService} from './auth.service';
import type {ResponseErrorJson} from '../models/error.model';
import type {ResponseTokens} from "../models/user.model.ts";
import {toast} from "sonner";

const API_BASE_URL = 'https://tesouraria-api-production.up.railway.app';
let refreshingPromise : Promise<ResponseTokens> | null = null;
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'pt-BR',
    },
});

/* =========================
   Request Interceptor
========================= */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenService.getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

/* =========================
   Response Interceptor
========================= */
api.interceptors.response.use(
    response => response,
    async (error: AxiosError<ResponseErrorJson>) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        const errorData: ResponseErrorJson = {
            errors: error.response?.data?.errors ?? ['Servidor fora do ar'],
            tokenIsExpired: error.response?.data?.tokenIsExpired ?? false,
        }

        if (!errorData.tokenIsExpired) for (const error of errorData.errors) toast.error(error)

        if (!originalRequest) return Promise.reject(errorData);

        if (error.response?.status === 401 && errorData?.tokenIsExpired && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = tokenService.getRefreshToken();
            if (!refreshToken) {
                tokenService.clearTokens();
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(errorData);
            }

            if (!refreshingPromise) {
                refreshingPromise = axios.post<ResponseTokens>(`${API_BASE_URL}/token/refresh`, { refreshToken })
                    .then(res => {
                        tokenService.setTokens(res.data.accessToken, res.data.refreshToken);
                        return res.data;
                    })
                    .finally(() => { refreshingPromise = null; });
            }

            try {
                const newTokens = await refreshingPromise;
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                tokenService.clearTokens();
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(errorData);
    }
);

export default api;
