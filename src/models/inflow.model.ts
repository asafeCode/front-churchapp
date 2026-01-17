import {InflowOrderBy, InflowType, OrderDirection, PaymentMethod} from './enums';

// Request para criar um inflow
export interface CreateInflowRequest {
    date: string; // ISO date string (yyyy-MM-dd)
    type: InflowType;
    paymentMethod: PaymentMethod;
    amount: number | string;
    description?: string;
    worshipId?: string;
    userId?: string | null;
}
export interface CreateInflowResponse {
    id: string;
    amount: number;
}

// Cada inflow retornado pelo backend
export interface ResponseInflowJson {
  id: string;
  description: string;
  date: string; // ISO
  inflowType: InflowType;
  memberName: string;
  worshipInfo: string;
  paymentMethod: PaymentMethod;
  amount: number;
}

// Response completo de lista de inflows
export interface ResponseInflowsJson {
    inflows: ResponseInflowJson[];
    totalAmount: number;
}

// Filtros enviados para a API
export interface InflowFilters {
    InitialDate?: string;  // yyyy-MM-dd
    EndDate?: string;    // yyyy-MM-dd
    Type?: InflowType;
    PaymentMethod?: PaymentMethod;
    AmountMin?: number;
    AmountMax?: number;
    Description?: string;
    CreatedByUserId?: string;
    MemberId?: string;
    WorshipId?: string;
    OrderBy?: InflowOrderBy;
    OrderDirection?: OrderDirection;
}
