// worship.service.ts
import api from './api';
import type { CreateWorshipRequest, ResponseRegisteredWorship, ResponseWorships } from '../models/worship.model';

export const worshipService = {
  createWorship: async (data: CreateWorshipRequest): Promise<ResponseRegisteredWorship> => {
    const response = await api.post<ResponseRegisteredWorship>('/worship', data);
    return response.data;
  },

  getWorships: async (): Promise<ResponseWorships> => {
      const response = await api.get<ResponseWorships>('/worship');
      return response.data;
  },
};
