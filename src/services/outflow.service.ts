import api from './api';
import type {
    CreateOutflowRequest,
    CreateOutflowResponse,
    OutflowsResponse,
    OutflowFilters, CreateOutflowFormData,
} from '../models/outflow.model';

export const outflowService = {
  getOutflows: async (filters: OutflowFilters = {}): Promise<OutflowsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') { params.append(key, value.toString()); }
    });

    const response = await api.get<OutflowsResponse>(`/outflows?${params.toString()}`);
    return response.data
  },

  createOutflow: async (outflowData: CreateOutflowRequest): Promise<CreateOutflowResponse> => {
      const payload : CreateOutflowFormData = {
          ...outflowData,
          amount: outflowData.amount == 0 ? null : Number(outflowData.amount),
      }
    const response = await api.post<CreateOutflowResponse>('/outflow', payload);
    return response.data;
  },
};