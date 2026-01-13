import api from './api';
import type {
    CreateTenantRequest,
    ResponseCreatedTenant, ResponseTenantsJson,
} from '../models/tenant.model';
import type {CreateInviteResponseDto, InviteVerifyResponse} from "../models/invite.model.ts";

export const tenantService = {
  createTenant: async (data: CreateTenantRequest): Promise<ResponseCreatedTenant> => {
    const response = await api.post<ResponseCreatedTenant>('/tenant', data);
    return response.data;
  },
    getTenants: async () : Promise<ResponseTenantsJson> => {
      const response = await api.get<ResponseTenantsJson>('/tenants');
      return response.data;
    },

    createInvite: async (): Promise<CreateInviteResponseDto> => {
        const response = await api.post<CreateInviteResponseDto>('/invites');
        return response.data;
    },
    verifyInvite: async ( Code: string) : Promise<InviteVerifyResponse> => {
      const { data } = await api.get<InviteVerifyResponse>(`/invites/verify`, {
          params: { Code },
      });
      return data;
    }
};
