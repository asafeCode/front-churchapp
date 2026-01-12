import api from './api';
import type {ExpenseFormData, ResponseExpensesJson,} from '../models/expense.model';
import {ExpenseType} from "../models/enums.ts";

export const expenseService = {
  createExpense: async (formData: ExpenseFormData): Promise<void> => {
        const payload : ExpenseFormData = {
            name: formData.name,
            type: formData.type,
            totalInstallments: formData.type == ExpenseType.PARCELADA? formData.totalInstallments : null,
            currentInstallment: formData.type == ExpenseType.PARCELADA? formData.currentInstallment : null,
            amountOfEachInstallment: formData.type == ExpenseType.PARCELADA? formData.amountOfEachInstallment : null,
        }

        await api.post('/expense', payload)
  },

  getExpenses: async (): Promise<ResponseExpensesJson> => {
      const response = await api.get<ResponseExpensesJson>('/expense');
      return response.data ;
  },

    updateExpense: async (expenseId: string, formData: ExpenseFormData) => {
      return `expenseId:${expenseId}, formData:${formData}`;
    },
    deleteExpense: async (expenseId: string) => {
        return `expenseId:${expenseId}`;
    },

};

