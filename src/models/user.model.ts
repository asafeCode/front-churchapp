import { UserRole, Gender } from './enums';

// -------------------------
// REQUESTS
// -------------------------

export interface RegisterUserRequest {
    name: string;
    role: UserRole;
    dateOfBirth: string; // ISO date string
    password: string;
}

export interface UpdateUserRequest {
    username: string;
    role: UserRole;
    dateOfBirth: string; // ISO date string

    // Informações pessoais
    fullName?: string;
    gender?: Gender;
    phone?: string;
    professionalWork?: string;

    // Informações eclesiásticas
    entryDate?: string; // ISO date string
    conversionDate?: string; // ISO date string
    isBaptized?: boolean;

    // Endereço
    city?: string;
    neighborhood?: string;
}

export interface ChangePasswordRequest {
    password: string;
    newPassword: string;
}

export interface DoLoginRequest {
    name: string;
    password: string;
    tenantId: string;
}

export interface OwnerLoginRequest {
    email: string;
    password: string;
}

// -------------------------
// FILTERS
// -------------------------

export interface UserFilters {
    name?: string;
    role?: UserRole;
    dateOfBirthInicial?: string; // ISO date string
    dateOfBirthFinal?: string;   // ISO date string
}

// -------------------------
// RESPONSES
// -------------------------

export interface ResponseRegisteredUser {
    id: string;
    name: string;
}

export interface ResponseLoggedUser {
    name: string;
    role: UserRole;
    tokens: ResponseTokens;
}

export interface ResponseLoggedOwner {
    name: string;
    tokens: ResponseTokens;
}

export interface ResponseTokens {
    accessToken: string;
    refreshToken: string | null;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  fullName?: string;

  role: UserRole;          // ✅ enum
  dateOfBirth: string;     // ISO date string
  age: number;

  // Informações pessoais
  gender?: Gender;         // ✅ enum
  phone?: string;
  professionalWork?: string;

  // Informações eclesiásticas
  entryDate?: string;
  conversionDate?: string;
  conversionTime?: number;
  isBaptized?: boolean;

  // Endereço
  city?: string;
  neighborhood?: string;
}

export interface UserProfiles {
  id: string;
  name: string;
  role: UserRole;          // ✅ enum
  dateOfBirth: string;     // ISO date string
}
export interface UsersResponse {
    users: UserProfiles[];
}

// -------------------------
// GENERIC RESPONSE (operação create/update simples)
// -------------------------

export interface UserOperationResponse {
    id: string;
    fullName?: string;
}
