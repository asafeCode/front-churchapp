import { format } from 'date-fns';
import { AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import type { ReportData, FinancialSummary } from './types';

interface ExpenseReportProps {
    reportData: ReportData;
    financialSummary: FinancialSummary;
}

export function ExpenseReport({ reportData, financialSummary }: ExpenseReportProps) {
    // Filtrar despesas parceladas (agora usando expenses para verificar tipo)
    const parceledExpenses = reportData.expenses.filter(
        (e) => e.expenseType === 'PARCELADA',
    );

    const highExpenses = reportData.outflows.filter((o) => o.amount > 1000);

    // Agrupar outflows por categoria usando expenses como referência
    const expensesByCategory = reportData.outflows.reduce((acc, outflow) => {
        // Encontrar o expense correspondente para obter a categoria
        const relatedExpense = reportData.expenses.find(e => e.id === outflow.expenseId);
        const category = relatedExpense?.category || outflow.description || 'Sem categoria';

        if (!acc[category]) {
            acc[category] = { count: 0, total: 0 };
        }
        acc[category].count += 1;
        acc[category].total += outflow.amount || 0;
        return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Função para obter data formatada
    const getFormattedDate = (item: { date?: string | Date }) => {
        if (!item.date) return 'Data não informada';
        try {
            return format(new Date(item.date), 'dd/MM/yyyy');
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                            <h3 className="font-semibold">Despesas Parceladas</h3>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-amber-600">{parceledExpenses.length}</p>
                            <p className="text-sm text-stone-500 mt-2">em andamento</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-rose-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-6 h-6 text-rose-600" />
                            <h3 className="font-semibold">Despesas Altas</h3>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-rose-600">{highExpenses.length}</p>
                            <p className="text-sm text-stone-500 mt-2">acima de R$ 1.000,00</p>
                            <p className="text-xs text-rose-600 mt-1">
                                Total: R${' '}
                                {highExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet className="w-6 h-6 text-blue-600" />
                            <h3 className="font-semibold">Total de Despesas</h3>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-blue-600">
                                {reportData.outflows.length}
                            </p>
                            <p className="text-sm text-stone-500 mt-2">registradas no mês</p>
                            <p className="text-xs text-blue-600 mt-1">
                                R$ {financialSummary.totalExpenses.toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {highExpenses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Despesas que Requerem Atenção</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {highExpenses.slice(0, 5).map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-rose-50"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{expense.description}</p>
                                        <p className="text-sm text-stone-500">
                                            {getFormattedDate(expense)}
                                        </p>
                                    </div>
                                    <Badge variant="destructive" className="ml-2 shrink-0">
                                        R$ {expense.amount.toFixed(2)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(expensesByCategory).map(([category, data]) => {
                            const percentage = financialSummary.totalExpenses > 0
                                ? (data.total / financialSummary.totalExpenses) * 100
                                : 0;
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{category}</span>
                                        <div className="text-right">
                                            <span className="font-medium">R$ {data.total.toFixed(2)}</span>
                                            <span className="text-stone-500 ml-2">({data.count} pagamentos)</span>
                                        </div>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}