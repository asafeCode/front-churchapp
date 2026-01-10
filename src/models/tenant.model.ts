// REQUEST
export interface CreateTenantRequest {
  name: string;
  domainName?: string | null;
}

// RESPONSE
export interface ResponseCreatedTenant {
  id: string;
  name: string;
}

export interface ResponseTenantsJson {
    tenants: ResponseTenantJson[];
}

export interface ResponseTenantJson {
    id: string;
    name: string;
}
