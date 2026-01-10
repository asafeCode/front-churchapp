'use client';

import {useState, useEffect, useCallback} from 'react';
import {format, startOfMonth, endOfMonth} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {Share2, Download} from 'lucide-react';

import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {Card, CardContent} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {Skeleton} from '../../components/ui/skeleton';
import {Label} from '../../components/ui/label';

// Importando componentes de relatórios
import {MonthlySummaryDetails} from './MonthlySummaryDetails';
import {ExpenseReport} from './ExpenseReport';
import {InflowReport} from './InflowReport';
import {MemberParticipation} from './/MemberParticipation';
import {ReportHeader} from './ReportHeader';
import {reportTemplates} from './ReportTemplates';
import type {ReportData, FinancialSummary} from './types';

// Importando serviços
import {expenseService} from '../../services/expense.service';
import {inflowService} from '../../services/inflow.service';
import {outflowService} from '../../services/outflow.service';
import {worshipService} from '../../services/worship.service';
import {userService} from '../../services/user.service';

export default function ReportsHub() {
    const [selectedReport, setSelectedReport] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const currentDate = new Date();
    const [filters, setFilters] = useState({
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
    });

    const getDateRange = useCallback((month: number, year: number) => {
        const initialDate = new Date(year, month, 1);
        const finalDate = new Date(year, month + 1, 0);

        return {
            InitialDate: format(initialDate, 'yyyy-MM-dd'),
            FinalDate: format(finalDate, 'yyyy-MM-dd'),
        };
    }, []);

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const dateRange = getDateRange(filters.month, filters.year);
            const startDate = startOfMonth(new Date(filters.year, filters.month, 1));
            const endDate = endOfMonth(new Date(filters.year, filters.month, 1));

            const [expenses, inflows, outflows, worships, users] = await Promise.all([
                expenseService.getExpenses(),
                inflowService.getInflows(dateRange),
                outflowService.getOutflows(dateRange),
                worshipService.getWorships(),
                userService.getAllUsers(),
            ]);

            const data: ReportData = {
                inflows: inflows.inflows || [],
                outflows: outflows.outflows || [],
                expenses: expenses.expenses || [],
                worships: worships.worships || [],
                users: users.users || [],
                period: {
                    start: startDate,
                    end: endDate,
                    month: format(startDate, 'MMMM yyyy', {locale: ptBR}),
                },
            };

            setReportData(data);
            calculateFinancialSummary(data);
        } finally {
            setLoading(false);
        }
    }, [filters.month, filters.year, getDateRange]);

    const calculateFinancialSummary = (data: ReportData) => {
        const totalInflows = data.inflows.reduce((sum, inflow) => sum + (inflow.amount || 0), 0);
        const totalOutflows = data.outflows.reduce((sum, outflow) => sum + (outflow.amount || 0), 0);
        const totalExpenses = totalOutflows; // Agora totalExpenses é igual a totalOutflows
        const balance = totalInflows - totalOutflows;

        // Calcular por culto
        const worshipTotals = data.worships.map((worship) => ({
            name: worship.description,
            total: data.inflows
                .filter((inflow) => inflow.worshipId === worship.id)
                .reduce((sum, inflow) => sum + (inflow.amount || 0), 0),
        }));

        const mostProfitableWorship = worshipTotals.reduce(
            (max, current) => (current.total > max.total ? current : max),
            {name: 'Nenhum', total: 0},
        );

        const averageInflowPerWorship =
            worshipTotals.length > 0
                ? worshipTotals.reduce((sum, w) => sum + w.total, 0) / worshipTotals.length
                : 0;

        // Calcular taxa de participação
        const uniqueContributors = [...new Set(data.inflows.map((i) => i.memberId))];
        const participationRate =
            data.users.length > 0 ? (uniqueContributors.length / data.users.length) * 100 : 0;

        // Calcular crescimento (simulação)
        const previousMonthBalance = totalInflows * 0.92 - totalOutflows;
        const growthPercentage =
            previousMonthBalance !== 0
                ? ((balance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100
                : 0;

        setFinancialSummary({
            totalInflows,
            totalOutflows,
            totalExpenses,
            balance,
            previousMonthBalance,
            growthPercentage,
            averageInflowPerWorship,
            mostProfitableWorship,
            participationRate,
        });
    };

    const copyToWhatsApp = () => {
        const formatCurrency = (value: number) =>
            new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(value);

        if (!reportData || !selectedReport || !financialSummary) return;

        const reportInfo = reportTemplates.find(r => r.key === selectedReport);
        if (!reportInfo) return;

        const periodMonth = reportData.period.month;
        const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');

        let message = `
📊 *${reportInfo.title}*
📅 *Período:* ${periodMonth}

_Gerado em ${currentDate}_
────────────────────
`;

        switch (selectedReport) {
            case 'monthly-summary-details':
                message += `
💰 *Financeiro Geral*
• Entradas totais: ${formatCurrency(financialSummary.totalInflows)}
• Despesas totais: ${formatCurrency(financialSummary.totalOutflows)}
• Total de gastos: ${formatCurrency(financialSummary.totalExpenses)}

✅ *Saldo final:* ${formatCurrency(financialSummary.balance)}
📈 *Crescimento:* ${financialSummary.growthPercentage >= 0 ? '+' : ''}${financialSummary.growthPercentage.toFixed(1)}%

⛪ *Média por culto:* ${formatCurrency(financialSummary.averageInflowPerWorship)}
🏆 *Culto mais produtivo:* ${financialSummary.mostProfitableWorship.name}
`;
                break;

            case 'expense-report': {
                const parceledExpenses = reportData.expenses.filter(e => e.expenseType === 'PARCELADA');
                const highExpenses = reportData.outflows.filter(o => o.amount > 1000);

                message += `
💸 *Relatório de Despesas*
• Total de despesas: ${reportData.expenses.length || 0}
• Parceladas: ${parceledExpenses.length || 0}
• Acima de R$ 1.000: ${highExpenses.length || 0}

💰 *Valor total gasto:* ${formatCurrency(financialSummary.totalExpenses)}
`;
                break;
            }

            case 'inflow-report':
                message += `
💰 *Relatório de Entradas*
• Entradas totais: ${formatCurrency(financialSummary.totalInflows)}
• Número de contribuições: ${reportData.inflows.length || 0}

⛪ *Média por culto:* ${formatCurrency(financialSummary.averageInflowPerWorship)}
🏆 *Culto mais produtivo:* ${financialSummary.mostProfitableWorship.name}
`;
                break;

            case 'member-participation': {
                const uniqueContributors = new Set(reportData.inflows.map(i => i.memberId));

                message += `
👥 *Participação dos Membros*
• Membros ativos: ${reportData.users.length || 0}
• Contribuintes únicos: ${uniqueContributors.size}
• Contribuições totais: ${reportData.inflows.length || 0}

📈 *Taxa de participação:* ${financialSummary.participationRate.toFixed(1)}%
`;
                break;
            }
        }

        message += `
────────────────────
🔄 *Atualizado em:* ${currentDate}
`;

        navigator.clipboard.writeText(message).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    };


    // Buscar dados quando os filtros mudarem
    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    // Renderizar relatório selecionado
    const renderReport = () => {
        if (!reportData || !financialSummary || !selectedReport) return null;

        const reportInfo = reportTemplates.find((r) => r.key === selectedReport);
        if (!reportInfo) return null;

        const IconComponent = reportInfo.icon;

        return (
            <>
                <ReportHeader
                    title={reportInfo.title}
                    description={reportInfo.description}
                    month={reportData.period.month}
                    date={format(new Date(), 'dd/MM/yyyy')}
                    icon={
                        <div className={`p-3 rounded-lg ${reportInfo.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${reportInfo.color}`}/>
                        </div>
                    }
                />

                {selectedReport === 'monthly-summary-details' && (
                    <MonthlySummaryDetails reportData={reportData} financialSummary={financialSummary}/>
                )}

                {selectedReport === 'expense-report' && (
                    <ExpenseReport reportData={reportData} financialSummary={financialSummary}/>
                )}

                {selectedReport === 'inflow-report' && (
                    <InflowReport reportData={reportData} financialSummary={financialSummary}/>
                )}

                {selectedReport === 'member-participation' && (
                    <MemberParticipation reportData={reportData} financialSummary={financialSummary}/>
                )}
            </>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Cabeçalho */}
                <div>
                    <h1 className="text-4xl font-heading font-semibold">Relatórios</h1>
                    <p className="text-stone-600">Gere e compartilhe relatórios claros para a liderança</p>
                </div>

                {/* Controles */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-700">Mês</Label>
                                <Select
                                    value={filters.month.toString()}
                                    onValueChange={(value) => setFilters({...filters, month: Number(value)})}
                                >
                                    <SelectTrigger className="w-full border-gray-300">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            'Janeiro',
                                            'Fevereiro',
                                            'Março',
                                            'Abril',
                                            'Maio',
                                            'Junho',
                                            'Julho',
                                            'Agosto',
                                            'Setembro',
                                            'Outubro',
                                            'Novembro',
                                            'Dezembro',
                                        ].map((month, index) => (
                                            <SelectItem key={index} value={index.toString()}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-gray-700">Ano</Label>
                                <Select
                                    value={filters.year.toString()}
                                    onValueChange={(value) => setFilters({...filters, year: Number(value)})}
                                >
                                    <SelectTrigger className="w-full border-gray-300">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2023, 2024, 2025, 2026].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-gray-700">Tipo de Relatório</Label>
                                <Select value={selectedReport} onValueChange={setSelectedReport} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um relatório"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTemplates.map((r) => (
                                            <SelectItem key={r.key} value={r.key}>
                                                <div className="flex items-center gap-2">
                                                    <r.icon className="w-4 h-4"/>
                                                    {r.title}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Relatório */}
                {loading ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-1/2"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-2/3"/>
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <Skeleton className="h-24"/>
                                    <Skeleton className="h-24"/>
                                    <Skeleton className="h-24"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : selectedReport && reportData && financialSummary ? (
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            {renderReport()}

                            {/* Ações */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                <Button
                                    onClick={copyToWhatsApp}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    disabled={copied}
                                >
                                    <Share2 className="w-4 h-4 mr-2"/>
                                    {copied ? 'Copiado!' : 'Compartilhar no WhatsApp'}
                                </Button>

                                <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2"/>
                                    Exportar PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : selectedReport ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-stone-500">Nenhum dado disponível para o período selecionado</p>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </DashboardLayout>
    );
}