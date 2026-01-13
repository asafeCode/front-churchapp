// services/user.service.ts
import api from './api';
import type {
    UserFilters,
    UserProfileResponse,
    UsersResponse,
    UpdateUserRequest,
    ChangePasswordRequest,
    RegisterUserRequest,
    ResponseRegisteredUser,
} from '../models/user.model';

export const userService = {
    getCurrentUser: async (): Promise<UserProfileResponse> => {
        const response = await api.get<UserProfileResponse>('/user');
        return response.data;
    },

    updateUser: async (userData: UpdateUserRequest): Promise<void> => {
         await api.put<void>('/user', userData);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await api.patch('/user/password', data);
    },

    deleteUser: async (force = false): Promise<void> => {
        await api.delete(`/user?force=${force}`);
    },

    getAllUsers: async (filters: UserFilters = {}): Promise<UsersResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') { params.append(key, String(value)); }
        });

        const response = await api.get<UsersResponse>('/users', { params } );
        return response.data;
    },

    getUserById: async (id: string): Promise<UserProfileResponse> => {
        const response = await api.get<UserProfileResponse>(`/users/${id}`);
        return response.data;
    },

    deleteUserById: async (id: string, force = false): Promise<void> => {
        await api.delete(`/users/${id}?force=${force}`);
    },

    registerUser: async (userData: RegisterUserRequest): Promise<ResponseRegisteredUser> => {
        const response = await api.post<ResponseRegisteredUser>('/auth/register/users', userData);
        return response.data;
    },
};
