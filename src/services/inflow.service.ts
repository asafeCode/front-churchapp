import api from './api';
import type { CreateInflowRequest, CreateInflowResponse, ResponseInflowsJson, InflowFilters } from '../models/inflow.model';

export const inflowService = {
  getInflows: async (filters: InflowFilters = {}): Promise<ResponseInflowsJson> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '')
          params.append(key, value.toString());
    });
    const response = await api.get<ResponseInflowsJson>(`/inflows?${params.toString()}`);
    return response.data
  },

  createInflow: async (inflowData: CreateInflowRequest): Promise<CreateInflowResponse> => {
    const response = await api.post<CreateInflowResponse>('/inflow', inflowData);
    return response.data;
  },
};
