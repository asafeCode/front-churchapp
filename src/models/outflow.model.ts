import {ExpenseType, PaymentMethod} from './enums';

// -------------------------
// REQUEST
// -------------------------
export interface CreateOutflowRequest {
  date: string; // ISO date string
  paymentMethod: PaymentMethod;
  amount: number | string;
  description?: string;
  expenseId: string;
}
export interface CreateOutflowFormData {
    date: string; // ISO date string
    paymentMethod: PaymentMethod;
    amount: number | null;
    description?: string;
    expenseId: string;
}
// -------------------------
// RESPONSE (item do GET)
// -------------------------
export interface ResponseShortOutflow {
  id: string;
  description: string;
  expenseName: string;
  expenseType: ExpenseType;
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
  totalAmount: number;
}

// -------------------------
// FILTERS
// -------------------------
export interface OutflowFilters {
  InitialDate?: string;
  EndDate?: string;
  PaymentMethod?: PaymentMethod;
  AmountMin?: number;
  AmountMax?: number;
  Description?: string;
  ExpenseType?: ExpenseType;
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
