import api from './api';
import type {
    CreateTenantRequest,
    ResponseCreatedTenant, ResponseTenantsJson,
} from '../models/tenant.model';

export const tenantService = {
  createTenant: async (data: CreateTenantRequest): Promise<ResponseCreatedTenant> => {
    const response = await api.post<ResponseCreatedTenant>('/tenant', data);
    return response.data;
  },
    getTenants: async () : Promise<ResponseTenantsJson> => {
      const response = await api.get<ResponseTenantsJson>('/tenants');
      return response.data;
    }
};
