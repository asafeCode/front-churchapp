import { ExpenseType } from './enums.ts';

/**
 * Modelo do FORM (estado da UI)
 * Regras de negócio aplicadas aqui
 */
export type ExpenseFormData =
  | {
      name: string;
      type: ExpenseType.FIXA | ExpenseType.VARIAVEL;
    }
  | {
      name: string;
      type: ExpenseType.PARCELADA;
      totalInstallments: number;
    };

/**
 * DTO que a API espera
 * (espelha CreateExpenseCommand do backend)
 */
export interface CreateExpenseApiRequest {
  name: string;
  type: ExpenseType;
  totalInstallments: number | null;
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
}

export interface ResponseExpensesJson {
  expenses: ResponseExpenseJson[];
}
