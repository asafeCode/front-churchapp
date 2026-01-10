import { PaymentMethod } from './enums';

// -------------------------
// REQUEST
// -------------------------
export interface CreateOutflowRequest {
  date: string; // ISO date string
  paymentMethod: PaymentMethod;
  amount: number | string;
  description?: string;
  currentInstallment?: number | null;
  expenseId: string;
}

// -------------------------
// RESPONSE (item do GET)
// -------------------------
export interface ResponseShortOutflow {
  id: string;
  expenseName: string;
  date: string; // ISO date string
  amount: number;
  paymentMethod: PaymentMethod; // ✅ enum
  currentInstallment?: number;
  totalInstallments?: number;
}

// -------------------------
// RESPONSE (GET /outflows)
// -------------------------
export interface OutflowsResponse {
  outflows: ResponseShortOutflow[];
}

// -------------------------
// FILTERS
// -------------------------
export interface OutflowFilters {
  InitialDate?: string;
  EndDate?: string;
  PaymentMethod?: PaymentMethod;
  AmountMin?: number;
  MmountMax?: number;
  Description?: string;
  CurrentInstallment?: number;
  ExpenseId?: string;
  CreatedByUserId?: string;
}

// -------------------------
// RESPONSE (POST)
// -------------------------
export interface CreateOutflowResponse {
  id: string;
  amount: number;
}
