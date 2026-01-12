import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Copy, DollarSign, TrendingUp, TrendingDown, Download, FileText, CreditCard, Home, CalendarDays, Receipt, Package, Users } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { reportService } from '../../services/report.service';
import type { ResponseMonthlySummaryDto, ReportFilterDto } from '../../models/report.model';

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ResponseMonthlySummaryDto | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Gera lista de anos (5 anos para trás, 1 para frente)
    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);

    // Nomes dos meses em português
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Gerar datas no formato DateOnly (yyyy-MM-dd)
    const getDateRange = (month: number, year: number): ReportFilterDto => {
        const initialDate = new Date(year, month, 1);
        const finalDate = new Date(year, month + 1, 0);

        return {
            DateFrom: format(initialDate, 'yyyy-MM-dd'),
            DateTo: format(finalDate, 'yyyy-MM-dd')
        };
    };

    // Carregar relatório
    const loadReport = async () => {
        try {
            setLoading(true);
            const filters = getDateRange(selectedMonth, selectedYear);
            const data = await reportService.getMontlySummary(filters);
            setReportData(data);
        } catch (error) {
            toast.error('Erro ao carregar relatório');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [selectedMonth, selectedYear]);

    // Navegação entre meses
    const handlePreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Formatar moeda
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Gerar texto para copiar
    const generateReportText = (): string => {
        if (!reportData) return '';

        // Extrair mês e ano do período
        const [startDate] = reportData.period.split(' a ');
        const [month, year] = startDate.split('/').slice(0, 2);
        const monthName = monthNames[parseInt(month) - 1];
        const periodTitle = `${monthName} | ${year}`;

        let text = `📊 *RELATÓRIO FINANCEIRO*\n`;
        text += `📅 Período: ${periodTitle}\n\n`;
        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `💰 *ENTRADAS*\n`;
        text += `• Dízimo: ${formatCurrency(reportData.inflowsAmountPerType.tithe)}\n`;
        text += `• Ofertas: ${formatCurrency(reportData.inflowsAmountPerType.offering)}\n`;
        text += `• Outros: ${formatCurrency(reportData.inflowsAmountPerType.other)}\n`;
        text += `➡️ *Total de Entradas:* ${formatCurrency(reportData.totalInflowsAmount)}\n\n`;

        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `💸 *SAÍDAS*\n`;
        text += `• Fixas: ${formatCurrency(reportData.outflowsAmountPerExpenseType.fixed)}\n`;
        text += `• Variáveis: ${formatCurrency(reportData.outflowsAmountPerExpenseType.variable)}\n`;
        text += `• Parceladas: ${formatCurrency(reportData.outflowsAmountPerExpenseType.installment)}\n`;
        text += `➡️ *Total de Saídas:* ${formatCurrency(reportData.totalOutflowsAmount)}\n\n`;

        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `⚖️ *SALDO DO PERÍODO*\n`;
        text += `➡️ *${formatCurrency(reportData.balance)}*\n\n`;

        if (reportData.installmentExpensesDetails.installmentExpenses.length > 0) {
            text += `━━━━━━━━━━━━━━━━━━\n`;
            text += `🧾 *DESPESAS PARCELADAS*\n`;
            reportData.installmentExpensesDetails.installmentExpenses.forEach(expense => {
                text += `• ${expense.name} – Parcela ${expense.currentInstallment}/${expense.totalInstallments}\n`;
                text += `  Valor da parcela: ${formatCurrency(expense.installmentAmount)}\n\n`;
            });
        }

        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `👤 Relatório gerado por: *${reportData.createdBy}*`;

        return text;
    };

    // Copiar relatório
    const handleCopyReport = async () => {
        const text = generateReportText();
        await navigator.clipboard.writeText(text);
        toast.success('Relatório copiado para a área de transferência!');
    };

    // Baixar como texto
    const handleDownloadReport = () => {
        const text = generateReportText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${monthNames[selectedMonth].toLowerCase()}-${selectedYear}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Relatório baixado!');
    };

    // Componente de estatística
    const StatCard = ({
                          title,
                          value,
                          icon: Icon,
                          variant = 'default',
                          loading: isLoading
                      }: {
        title: string;
        value: string;
        icon: React.ElementType;
        variant?: 'default' | 'positive' | 'negative';
        loading: boolean;
    }) => {
        const variants = {
            default: 'bg-white border-stone-200 shadow-sm',
            positive: 'bg-green-50 border-green-200 shadow-sm',
            negative: 'bg-red-50 border-red-200 shadow-sm'
        };

        const iconColors = {
            default: 'text-stone-600',
            positive: 'text-green-600',
            negative: 'text-red-600'
        };

        return (
            <Card className={`border ${variants[variant]}`}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-stone-500 mb-1">{title}</p>
                            {isLoading ? (
                                <Skeleton className="h-7 w-24" />
                            ) : (
                                <p className="text-2xl font-bold text-stone-900">{value}</p>
                            )}
                        </div>
                        <div className={`p-2 rounded-full ${iconColors[variant]} bg-opacity-20`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <DashboardLayout>
            <div className="min-h-full bg-stone-50">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">Relatório Mensal</h1>
                            <p className="text-stone-600 mt-1">Acompanhe o desempenho financeiro do mês</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCopyReport}
                                className="gap-2 border-stone-300 hover:bg-stone-100"
                            >
                                <Copy className="w-4 h-4" />
                                <span className="hidden sm:inline">Copiar Relatório</span>
                                <span className="inline sm:hidden">Copiar</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDownloadReport}
                                className="gap-2 border-stone-300 hover:bg-stone-100"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Baixar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Filtros de período */}
                    <Card className="mb-6 border-stone-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-stone-500" />
                                    <span className="font-medium text-stone-700">Selecione o período:</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePreviousMonth}
                                        className="h-10 w-10 border-stone-300 hover:bg-stone-100"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Select
                                            value={selectedMonth.toString()}
                                            onValueChange={(value) => setSelectedMonth(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-full sm:w-[140px] border-stone-300">
                                                <SelectValue placeholder="Mês" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthNames.map((month, index) => (
                                                    <SelectItem key={month} value={index.toString()}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={selectedYear.toString()}
                                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-full sm:w-[120px] border-stone-300">
                                                <SelectValue placeholder="Ano" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNextMonth}
                                        className="h-10 w-10 border-stone-300 hover:bg-stone-100"
                                        disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth()}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {reportData && !loading && (
                                <div className="mt-4 text-center sm:text-left">
                                    <Badge variant="outline" className="text-sm border-stone-300 text-stone-700">
                                        {reportData.period}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Estatísticas principais */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cards de resumo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                title="Total de Entradas"
                                value={reportData ? formatCurrency(reportData.totalInflowsAmount) : 'R$ 0,00'}
                                icon={TrendingUp}
                                variant="positive"
                                loading={loading}
                            />
                            <StatCard
                                title="Total de Saídas"
                                value={reportData ? formatCurrency(reportData.totalOutflowsAmount) : 'R$ 0,00'}
                                icon={TrendingDown}
                                variant="negative"
                                loading={loading}
                            />
                            <StatCard
                                title="Saldo do Período"
                                value={reportData ? formatCurrency(reportData.balance) : 'R$ 0,00'}
                                icon={DollarSign}
                                variant={reportData?.balance && reportData.balance >= 0 ? 'positive' : 'negative'}
                                loading={loading}
                            />
                        </div>

                        {/* Entradas por tipo */}
                        <Card className="border-stone-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-stone-100 rounded-md">
                                            <CreditCard className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <h3 className="font-semibold text-stone-800">Entradas por Tipo</h3>
                                    </div>

                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <Skeleton key={i} className="h-12" />
                                            ))}
                                        </div>
                                    ) : reportData ? (
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    label: 'Dízimo',
                                                    value: reportData.inflowsAmountPerType.tithe,
                                                    color: 'bg-green-500',
                                                    icon: Users
                                                },
                                                {
                                                    label: 'Ofertas',
                                                    value: reportData.inflowsAmountPerType.offering,
                                                    color: 'bg-blue-500',
                                                    icon: Receipt
                                                },
                                                {
                                                    label: 'Outros',
                                                    value: reportData.inflowsAmountPerType.other,
                                                    color: 'bg-purple-500',
                                                    icon: Package
                                                }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                        <span className="font-medium text-stone-700">{item.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-stone-900">{formatCurrency(item.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Saídas por tipo */}
                        <Card className="border-stone-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-stone-100 rounded-md">
                                            <Home className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <h3 className="font-semibold text-stone-800">Saídas por Tipo</h3>
                                    </div>

                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <Skeleton key={i} className="h-12" />
                                            ))}
                                        </div>
                                    ) : reportData ? (
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    label: 'Despesas Fixas',
                                                    value: reportData.outflowsAmountPerExpenseType.fixed,
                                                    color: 'bg-red-500'
                                                },
                                                {
                                                    label: 'Despesas Variáveis',
                                                    value: reportData.outflowsAmountPerExpenseType.variable,
                                                    color: 'bg-orange-500'
                                                },
                                                {
                                                    label: 'Despesas Parceladas',
                                                    value: reportData.outflowsAmountPerExpenseType.installment,
                                                    color: 'bg-yellow-500'
                                                }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                        <span className="font-medium text-stone-700">{item.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-stone-900">{formatCurrency(item.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna 2: Despesas parceladas e informações */}
                    <div className="space-y-6">
                        <Card className="border-stone-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-stone-100 rounded-md">
                                            <FileText className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <h3 className="font-semibold text-stone-800">Despesas Parceladas</h3>
                                    </div>

                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2].map(i => (
                                                <Skeleton key={i} className="h-20" />
                                            ))}
                                        </div>
                                    ) : reportData?.installmentExpensesDetails.installmentExpenses.length ? (
                                        <div className="space-y-4">
                                            {reportData.installmentExpensesDetails.installmentExpenses.map((expense, index) => (
                                                <Card key={index} className="border-stone-200 shadow-sm">
                                                    <CardContent className="p-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold text-stone-800">{expense.name}</h4>
                                                                <Badge variant="outline" className="border-stone-300">
                                                                    {expense.currentInstallment}/{expense.totalInstallments}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-stone-600">Valor da parcela:</span>
                                                                <span className="font-semibold text-stone-900">{formatCurrency(expense.installmentAmount)}</span>
                                                            </div>
                                                            <div className="pt-2">
                                                                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500"
                                                                        style={{ width: `${(expense.currentInstallment / expense.totalInstallments) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between text-xs text-stone-500 mt-1">
                                                                    <span>Início</span>
                                                                    <span>{Math.round((expense.currentInstallment / expense.totalInstallments) * 100)}%</span>
                                                                    <span>Concluído</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                                            <p className="text-stone-500">Nenhuma despesa parcelada neste período</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informações adicionais */}
                        <Card className="border-stone-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-stone-100 rounded-md">
                                            <CalendarDays className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <h3 className="font-semibold text-stone-800">Informações</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-600">Período:</span>
                                            <span className="font-medium text-stone-900">{reportData?.period || 'Carregando...'}</span>
                                        </div>
                                        <Separator className="bg-stone-200" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-600">Gerado por:</span>
                                            <span className="font-medium text-stone-900">{reportData?.createdBy || 'Carregando...'}</span>
                                        </div>
                                        <Separator className="bg-stone-200" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-600">Data de geração:</span>
                                            <span className="font-medium text-stone-900">{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-stone-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-stone-500">
                            <p>Relatório gerado automaticamente pelo sistema de tesouraria</p>
                            <p className="mt-1">Os valores são baseados nas entradas e saídas registradas</p>
                        </div>
                        <Button
                            onClick={loadReport}
                            variant="outline"
                            className="border-stone-300 hover:bg-stone-100"
                            disabled={loading}
                        >
                            {loading ? 'Atualizando...' : 'Atualizar Relatório'}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};