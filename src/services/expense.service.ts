import api from './api';
import type {
    CreateExpenseApiRequest,
    ExpenseFormData,
    ResponseExpensesJson,
    ResponseRegisteredExpenseJson,
} from '../models/expense.model';
import {ExpenseType} from '../models/enums';

export const expenseService = {
  createExpense: async (formData: ExpenseFormData): Promise<ResponseRegisteredExpenseJson> => {
    const payload: CreateExpenseApiRequest = {
      name: formData.name,
      type: formData.type,
      totalInstallments:
        formData.type === ExpenseType.PARCELADA
          ? formData.totalInstallments
          : null,
    };
    const response = await api.post<ResponseRegisteredExpenseJson>('/expense', payload);
    return response.data;
  },

  getExpenses: async (): Promise<ResponseExpensesJson> => {
      const response = await api.get<ResponseExpensesJson>('/expense');
      return response.data ;
  },
};

