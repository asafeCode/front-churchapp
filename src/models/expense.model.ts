import { ExpenseType } from './enums.ts';

/**
 * Modelo do FORM (estado da UI)
 * Regras de negócio aplicadas aqui
 */
export type ExpenseFormData = {
    name: string;
    type: ExpenseType;
    currentInstallment: number | null;
    totalInstallments: number | null;
    amountOfEachInstallment: number | null;
};


/**
 * DTO que a API espera
 * (espelha CreateExpenseCommand do backend)
 */
export interface CreateExpenseApiRequest {
  name: string;
  type: ExpenseType;
  currentInstallment: number | null;
  totalInstallments: number | null;
  AmountOfEachInstallment: number | null;
}

/**
 * Responses
 */
export interface ResponseRegisteredExpenseJson {
  id: string;
  name: string;
  type: ExpenseType;
}

export interface ResponseExpenseJson {
  id: string;
  name: string;
  expenseType: ExpenseType;
  totalInstallments: number | null;
  currentInstallment: number | null;
  amountOfEachInstallment: number | null;
}

export interface ResponseExpensesJson {
  expenses: ResponseExpenseJson[];
}
