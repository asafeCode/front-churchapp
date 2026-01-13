// src/models/invite.model.ts
export interface InviteVerifyResponse {
    isValid: boolean;
    tenantName: string;
    code: string;
}

export interface CreateInviteResponseDto {
    link: string;
}