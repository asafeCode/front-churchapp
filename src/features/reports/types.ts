import type { ResponseExpenseJson } from '../../models/expense.model';
import type { ResponseInflowJson } from '../../models/inflow.model';
import type { ResponseShortOutflow } from '../../models/outflow.model';
import type { ResponseWorship } from '../../models/worship.model';
import type { UserProfiles } from '../../models/user.model';

export interface ReportData {
    inflows: ResponseInflowJson[];
    outflows: ResponseShortOutflow[];
    expenses: ResponseExpenseJson[];
    worships: ResponseWorship[];
    users: UserProfiles[];
    period: {
        start: Date;
        end: Date;
        month: string;
    };
}

export interface FinancialSummary {
    totalInflows: number;
    totalOutflows: number;
    balance: number;
    previousMonthBalance: number;
    growthPercentage: number;
    averageInflowPerWorship: number;
    mostProfitableWorship: {
        name: string;
        total: number;
    };
    totalExpenses: number;
    participationRate: number;
}

export interface ReportTemplate {
    key: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}