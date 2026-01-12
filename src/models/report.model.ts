export interface ReportFilterDto {
    DateFrom: string
    DateTo: string
}

export interface ResponseMonthlySummaryDto {
    period: string;

    totalInflowsAmount: number;
    totalOutflowsAmount: number;
    balance: number;

    inflowsAmountPerType: InflowsAmountPerType;
    outflowsAmountPerExpenseType: OutflowsAmountPerExpenseType;

    installmentExpensesDetails: InstallmentExpensesDetails;

    createdBy: string;
}

export interface InflowsAmountPerType {
    tithe: number;
    offering: number;
    other: number;
}

export interface OutflowsAmountPerExpenseType {
    fixed: number;
    variable: number;
    installment: number;
}

export interface InstallmentExpensesDetails {
    installmentExpenses: InstallmentExpenseDetail[];
}

export interface InstallmentExpenseDetail {
    name: string;
    currentInstallment: number;
    totalInstallments: number;
    installmentAmount: number;
}
