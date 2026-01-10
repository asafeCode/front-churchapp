'use client';

import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { DayOfWeekLabels } from '../../models/enum-labels';
import type { ReportData, FinancialSummary } from './types';

interface MonthlySummaryDetailsProps {
    reportData: ReportData;
    financialSummary: FinancialSummary;
}

export function MonthlySummaryDetails({ reportData, financialSummary }: MonthlySummaryDetailsProps) {
    // Função para obter a data formatada de um outflow
    const getFormattedDate = (item: { date?: string | Date }) => {
        if (!item.date) return 'Data não informada';
        try {
            return format(new Date(item.date), 'dd/MM/yyyy');
        } catch {
            return 'Data inválida';
        }
    };

    // Obter as 5 maiores despesas (outflows) para exibir
    const topExpenses = [...reportData.outflows]
        .sort((a, b) => (b.amount || 0) - (a.amount || 0))
        .slice(0, 5);

    // Formatar valor em reais
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Cards principais - Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-stone-500">Entradas Totais</p>
                                <h3 className="text-lg md:text-2xl font-bold text-emerald-600 mt-1">
                                    {formatCurrency(financialSummary.totalInflows)}
                                </h3>
                                <p className="text-xs text-stone-400 mt-1 md:mt-2">
                                    {reportData.inflows.length} contribuições
                                </p>
                            </div>
                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-stone-500">Despesas Totais</p>
                                <h3 className="text-lg md:text-2xl font-bold text-rose-600 mt-1">
                                    {formatCurrency(financialSummary.totalOutflows)}
                                </h3>
                                <p className="text-xs text-stone-400 mt-1 md:mt-2">
                                    {reportData.outflows.length} saídas
                                </p>
                            </div>
                            <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-rose-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-stone-500">Saldo Final</p>
                                <h3 className={`text-lg md:text-2xl font-bold mt-1 ${
                                    financialSummary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                    {formatCurrency(financialSummary.balance)}
                                </h3>
                                <div className="mt-1 md:mt-2">
                                    <Badge
                                        variant={financialSummary.growthPercentage >= 0 ? 'default' : 'destructive'}
                                        className="text-xs px-2 py-1"
                                    >
                                        {financialSummary.growthPercentage >= 0 ? '↗' : '↘'}{' '}
                                        {Math.abs(financialSummary.growthPercentage).toFixed(1)}%
                                    </Badge>
                                </div>
                            </div>
                            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-stone-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-stone-500">Culto Mais Produtivo</p>
                                <h3 className="text-base md:text-xl font-bold text-blue-600 mt-1 truncate">
                                    {financialSummary.mostProfitableWorship.name}
                                </h3>
                                <p className="text-xs text-stone-400 mt-1 md:mt-2">
                                    {formatCurrency(financialSummary.mostProfitableWorship.total)}
                                </p>
                            </div>
                            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grid inferior - Responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="h-full">
                    <CardHeader className="pb-3 md:pb-4">
                        <CardTitle className="text-base md:text-lg">Distribuição por Culto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {reportData.worships.map((worship) => {
                                const worshipTotal = reportData.inflows
                                    .filter((inflow) => inflow.worshipId === worship.id)
                                    .reduce((sum, inflow) => sum + (inflow.amount || 0), 0);

                                const percentage =
                                    financialSummary.totalInflows > 0
                                        ? (worshipTotal / financialSummary.totalInflows) * 100
                                        : 0;

                                const contributionCount = reportData.inflows.filter(
                                    (i) => i.worshipId === worship.id
                                ).length;

                                return (
                                    <div key={worship.id} className="space-y-1 md:space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <span className="text-sm font-medium truncate">
                                                {DayOfWeekLabels[worship.dayOfWeek]} | {worship.time}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(worshipTotal)}
                                                </span>
                                                <span className="text-xs text-stone-500 ml-1 sm:ml-2">
                                                    ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Progress value={percentage} className="h-1.5 md:h-2" />
                                            <div className="flex justify-between text-xs text-stone-500">
                                                <span>{contributionCount} contribuições</span>
                                                <span>{percentage.toFixed(1)}% do total</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader className="pb-3 md:pb-4">
                        <CardTitle className="text-base md:text-lg">Maiores Despesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                <span className="text-sm font-medium">Total de Gastos</span>
                                <span className="text-base md:text-lg font-bold text-rose-600">
                                    {formatCurrency(financialSummary.totalExpenses)}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {topExpenses.length > 0 ? (
                                    topExpenses.map((outflow) => (
                                        <div
                                            key={outflow.id}
                                            className="flex items-center justify-between p-2 md:p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-stone-500 truncate">
                                                    {getFormattedDate(outflow)}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="destructive"
                                                className="ml-2 shrink-0 text-xs md:text-sm px-2 py-1"
                                            >
                                                {formatCurrency(outflow.amount || 0)}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-stone-500 text-sm">Nenhuma despesa registrada</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t">
                                <p className="text-xs text-stone-400 text-center">
                                    Mostrando {Math.min(5, reportData.outflows.length)} de{' '}
                                    {reportData.outflows.length} despesas
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Estatísticas extras para mobile */}
            <div className="block lg:hidden">
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                                <p className="text-xs text-stone-500">Cultos Ativos</p>
                                <p className="text-lg font-bold text-blue-600 mt-1">
                                    {reportData.worships.length}
                                </p>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                                <p className="text-xs text-stone-500">Taxa de Participação</p>
                                <p className="text-lg font-bold text-purple-600 mt-1">
                                    {financialSummary.participationRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}