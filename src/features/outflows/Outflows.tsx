'use client';

import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import type {CreateOutflowRequest, ResponseShortOutflow} from "../../models/outflow.model.ts";
import {ExpenseType, PaymentMethod} from "../../models/enums.ts";
import {outflowService} from "../../services/outflow.service.ts";
import {expenseService} from "../../services/expense.service.ts";
import {toast} from "sonner";
import {DashboardLayout} from "../../components/layout/DashboardLayout.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog.tsx";
import {Button} from "../../components/ui/button.tsx";
import {
    Calendar,
    CalendarClock,
    CalendarHeart,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Divide,
    DollarSign,
    FileText,
    Filter,
    Plus,
    Receipt,
    TrendingUp,
    X
} from "lucide-react";
import {Label} from "@radix-ui/react-label";
import {Input} from "../../components/ui/input.tsx";
import {EnumSelect} from "../../components/ui/enum-select.tsx";
import {ExpenseTypeLabels, PaymentMethodLabels} from "../../models/enum-labels.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select.tsx";
import {Card, CardContent} from "../../components/ui/card.tsx";
import {Badge} from "../../components/ui/badge.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import type {ResponseExpenseJson} from "../../models/expense.model.ts";
import {MoneyInput} from "../../components/ui/money-input.tsx";
import { ptBR } from "date-fns/locale";

export default function Outflows() {
    const [outflows, setOutflows] = useState<ResponseShortOutflow[]>([]);
    const [expenses, setExpenses] = useState<ResponseExpenseJson[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Presets de valores para filtro
    const amountPresets = [
        { value: 'all', label: 'Todos os valores' },
        { value: '0-100', label: 'Até R$ 100' },
        { value: '100-500', label: 'R$ 100 - 500' },
        { value: '500-1000', label: 'R$ 500 - 1.000' },
        { value: '1000+', label: 'Acima de R$ 1.000' }
    ];

    // Filtros atualizados com tipo de despesa
    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        expenseId: 'all',
        expenseType: 'all' as string | ExpenseType,
        amountRange: 'all',
    });

    // Gerar datas com base no mês/ano selecionado
    const getDateRange = (month: number, year: number) => {
        const initialDate = new Date(year, month, 1);
        const finalDate = new Date(year, month + 1, 0);

        return {
            InitialDate: format(initialDate, 'yyyy-MM-dd'),
            EndDate: format(finalDate, 'yyyy-MM-dd'),
        };
    };

    const [formData, setFormData] = useState<CreateOutflowRequest>({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        description: '',
        expenseId: '',
        paymentMethod: PaymentMethod.FISICO, // Adicionado campo obrigatório
    });

    /* ===================== LOAD ===================== */

    useEffect(() => {
        loadOutflows();
        loadExpenses();
    }, [filters]);

    const loadOutflows = async () => {
        try {
            setLoading(true);

            const dateRange = getDateRange(filters.month, filters.year);
            let amountMin: number | undefined = undefined;
            let amountMax: number | undefined = undefined;

            if (filters.amountRange !== 'all') {
                switch (filters.amountRange) {
                    case '0-100':
                        amountMin = 0;
                        amountMax = 100;
                        break;
                    case '100-500':
                        amountMin = 100;
                        amountMax = 500;
                        break;
                    case '500-1000':
                        amountMin = 500;
                        amountMax = 1000;
                        break;
                    case '1000+':
                        amountMin = 1000;
                        amountMax = undefined;
                        break;
                    default:
                        return true;
                }
            }

            const response = await outflowService.getOutflows({
                ...dateRange,
                ExpenseId: filters.expenseId === 'all' ? undefined : filters.expenseId,
                ExpenseType: filters.expenseType === 'all' ? undefined : filters.expenseType as ExpenseType,
                AmountMin: filters.amountRange === 'all' ? undefined : amountMin,
                AmountMax: filters.amountRange === 'all' ? undefined : amountMax,
            });

            setOutflows(response.outflows);
            setTotalAmount(response.totalAmount);
        } finally {
            setLoading(false);
        }
    };

    const loadExpenses = async () => {
        const response = await expenseService.getExpenses();
        setExpenses(response.expenses);
    };

    /* ===================== FILTERS ===================== */

    const handleClearFilters = () => {
        setFilters({
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            expenseId: 'all',
            expenseType: 'all',
            amountRange: 'all',
        });
        toast.info("Filtros limpos");
    };

    const hasActiveFilters = () => {
        return filters.expenseId !== 'all' ||
            filters.expenseType !== 'all' ||
            filters.amountRange !== 'all';
    };

    const getMonthName = (monthIndex: number) => {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return monthNames[monthIndex];
    };

    const getSelectedExpenseName = () => {
        if (filters.expenseId === 'all') return 'Todas';
        const expense = expenses.find(e => e.id === filters.expenseId);
        return expense?.name || 'Despesa não encontrada';
    };

    const getAmountRangeLabel = () => {
        const preset = amountPresets.find(p => p.value === filters.amountRange);
        return preset?.label || 'Todos os valores';
    };

    const selectedExpense = expenses.find(
        e => e.id === formData.expenseId
    );

    const isParcelada =
        selectedExpense?.expenseType === ExpenseType.PARCELADA;

    const getExpenseBadgeColor = (type: ExpenseType) => {
        switch(type) {
            case ExpenseType.PARCELADA:
                return 'bg-blue-100 text-blue-600 border-blue-200';
            case ExpenseType.FIXA:
                return 'bg-green-50 text-green-700 border-green-100';
            case ExpenseType.VARIAVEL:
                return 'bg-amber-200 text-amber-900 border-amber-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getExpenseIcon = (type: ExpenseType) => {
        switch(type) {
            case ExpenseType.PARCELADA:
                return <CreditCard className="w-5 h-5 text-blue-600" />;
            case ExpenseType.FIXA:
                return <DollarSign className="w-5 h-5 text-green-500" />;
            case ExpenseType.VARIAVEL:
                return <TrendingUp className="w-5 h-5 text-amber-400" />;
            default:
                return <Receipt className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch(method) {
            case PaymentMethod.FISICO:
                return <DollarSign className="w-4 h-4 text-blue-500" />;
            case PaymentMethod.DIGITAL:
                return <CreditCard className="w-4 h-4 text-blue-400" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-500" />;
        }
    };

    const isTodayDate = (date: Date): boolean => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isRecentDate = (date: Date, days: number): boolean => {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    };

    /* ===================== CREATE ===================== */

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        await outflowService.createOutflow({
            ...formData,
            amount: Number(formData.amount),
        });

        toast.success('Saída criada com sucesso');
        setOpenCreate(false);
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            amount: 0,
            description: '',
            expenseId: '',
            paymentMethod: PaymentMethod.FISICO,
        });

        loadOutflows();
    };

    /* ===================== RENDER ===================== */
    return (
        <DashboardLayout>
            <div className="space-y-6 mt-4">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-4xl font-heading font-semibold text-gray-900">
                            Saídas
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Gerencie as saídas financeiras
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Botão para mostrar/ocultar filtros - FUNCIONA EM TODOS OS DISPOSITIVOS */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">Ocultar Filtros</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">Mostrar Filtros</span>
                                </>
                            )}
                        </Button>

                        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">Nova Saída</span>
                                    <span className="md:hidden">Nova</span>
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Criar Saída</DialogTitle>
                                    <DialogDescription>
                                        Registre uma nova saída financeira
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Data</Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) =>
                                                    setFormData({...formData, date: e.target.value})
                                                }
                                                required
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Método de Pagamento</Label>
                                            <EnumSelect
                                                value={formData.paymentMethod}
                                                labels={PaymentMethodLabels}
                                                onChange={(paymentMethod) =>
                                                    setFormData({...formData, paymentMethod})
                                                }
                                                placeholder="Selecione o método"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Despesa</Label>
                                        <Select
                                            value={formData.expenseId || 'none'}
                                            onValueChange={(value) => {
                                                setFormData({
                                                    ...formData,
                                                    expenseId: value === 'none' ? '' : value,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="border-gray-300">
                                                <SelectValue placeholder="Selecione a despesa"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecione uma despesa</SelectItem>
                                                {expenses.map((expense) => (
                                                    <SelectItem key={expense.id} value={expense.id}>
                                                        {expense.name} | {ExpenseTypeLabels[expense.expenseType]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.expenseId && (
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Valor</Label>

                                            <MoneyInput
                                                value={
                                                    isParcelada
                                                        ? String(selectedExpense?.amountOfEachInstallment ?? 0)
                                                        : formData.amount
                                                            ? String(formData.amount)
                                                            : ""
                                                }
                                                disabled={isParcelada}
                                                onChange={(value) => {
                                                    if (isParcelada) return;

                                                    setFormData({
                                                        ...formData,
                                                        amount: Number(value),
                                                    });
                                                }}
                                                required={!isParcelada}
                                                className="border-gray-300"
                                            />

                                            {isParcelada && (
                                                <p className="text-sm text-gray-500">
                                                    Esta é uma despesa parcelada. Para alterar o valor da parcela,
                                                    edite a despesa em{" "}
                                                    <a
                                                        href="/expenses"
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        Despesas
                                                    </a>.
                                                </p>
                                            )}
                                        </div>
                                    )}


                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Descrição (Opcional)</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Descrição adicional"
                                            className="border-gray-300"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                                        Criar Saída
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* CARD DE RESUMO DO MÊS/ANO - VERMELHO */}
                <Card className="bg-red-100 border-red-50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="text-lg font-semibold text-red-900">
                                    {getMonthName(filters.month)} {filters.year}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Período selecionado
                                </p>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-sm text-gray-600">Total Gasto</p>
                                <p className="text-2xl md:text-3xl font-bold text-red-600">
                                    R$ {totalAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {outflows.length} {outflows.length === 1 ? 'saída' : 'saídas'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FILTROS - Responsive */}
                <div className={`${showFilters ? 'block' : 'hidden'}`}>
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Filtros</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    {hasActiveFilters() && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="text-gray-600 hover:text-gray-900 text-xs"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Limpar filtros
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {hasActiveFilters() && (
                                <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                    {filters.expenseId !== 'all' && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                            <Receipt className="w-3 h-3 mr-1" />
                                            {getSelectedExpenseName()}
                                        </Badge>
                                    )}
                                    {filters.expenseType !== 'all' && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                            Tipo: {ExpenseTypeLabels[filters.expenseType as ExpenseType]}
                                        </Badge>
                                    )}
                                    {filters.amountRange !== 'all' && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                            Valor: {getAmountRangeLabel()}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                {/* MÊS */}
                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-xs md:text-sm text-gray-700">Mês</Label>
                                    <Select
                                        value={filters.month.toString()}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, month: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
                                            ].map((month, index) => (
                                                <SelectItem key={index} value={index.toString()} className="text-sm">
                                                    {month}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ANO */}
                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-xs md:text-sm text-gray-700">Ano</Label>
                                    <Select
                                        value={filters.year.toString()}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, year: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2023, 2024, 2025, 2026].map((year) => (
                                                <SelectItem key={year} value={year.toString()} className="text-sm">
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* DESPESA */}
                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-xs md:text-sm text-gray-700">Despesa</Label>
                                    <Select
                                        value={filters.expenseId}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, expenseId: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300 text-sm">
                                            <SelectValue>
                                                <span className="truncate">
                                                    {filters.expenseId === 'all' ? 'Todas as despesas' : getSelectedExpenseName()}
                                                </span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-sm">Todas as despesas</SelectItem>
                                            {expenses.map((expense) => (
                                                <SelectItem key={expense.id} value={expense.id} className="text-sm">
                                                    {expense.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* TIPO DE DESPESA */}
                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-xs md:text-sm text-gray-700">Tipo de Despesa</Label>
                                    <EnumSelect
                                        value={Number(filters.expenseType)}
                                        labels={ExpenseTypeLabels}
                                        onChange={(value) =>
                                            setFilters({...filters, expenseType: value})
                                        }
                                        placeholder="Selecione o tipo"
                                    />
                                </div>

                                {/* PRESET DE VALOR */}
                                <div className="space-y-1.5 md:space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label className="text-xs md:text-sm text-gray-700">Faixa de Valor</Label>
                                    <Select
                                        value={filters.amountRange}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, amountRange: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {amountPresets.map((preset) => (
                                                <SelectItem key={preset.value} value={preset.value} className="text-sm">
                                                    {preset.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* LISTA DE SAÍDAS */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4 md:p-5">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : outflows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6"
                                 data-testid="empty-outflows-state">
                                <div className="mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                        <Calendar className="w-10 h-10 text-red-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Nenhuma saída encontrada
                                </h3>
                                <p className="text-gray-600 max-w-md mb-6">
                                    {hasActiveFilters()
                                        ? "Tente ajustar os filtros para encontrar saídas registradas"
                                        : `Não há saídas registradas para ${getMonthName(filters.month)} ${filters.year}`}
                                </p>
                                {hasActiveFilters() && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        className="gap-2 border-gray-300 hover:border-gray-400"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {outflows.map((outflow) => {
                                    const formattedDate = new Date(outflow.date);
                                    const isToday = isTodayDate(formattedDate);
                                    const isRecent = isRecentDate(formattedDate, 7);
                                    const isInstallment = outflow.currentInstallment && outflow.totalInstallments;
                                    const remainingInstallments = isInstallment
                                        ? outflow.totalInstallments! - outflow.currentInstallment!
                                        : 0;
                                    const expenseType = outflow.expenseType;

                                    return (
                                        <Card
                                            key={outflow.id}
                                            className="bg-white border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col group hover:-translate-y-1"
                                        >
                                            <CardContent className="p-4 md:p-5 flex flex-col flex-1">
                                                {/* Cabeçalho - Data e Tipo */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isToday ? 'bg-red-100' : 'bg-gray-100'}`}>
                                                            {isToday ? (
                                                                <CalendarHeart className="w-5 h-5 text-red-600" />
                                                            ) : isRecent ? (
                                                                <CalendarClock className="w-5 h-5 text-orange-600" />
                                                            ) : (
                                                                <Calendar className="w-5 h-5 text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 text-base md:text-lg">
                                                                {format(formattedDate, 'dd/MM/yyyy')}
                                                            </div>
                                                            <div className="text-xs md:text-sm text-gray-500">
                                                                {format(formattedDate, 'EEEE', { locale: ptBR })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tipo de Despesa usando as funções - AGORA DIRETO DO outflow.expenseType */}
                                                    {typeof expenseType === 'number' && (
                                                        <Badge variant="outline" className={getExpenseBadgeColor(expenseType)}>
                                                            <div className="flex items-center gap-1.5">
                                                                {getExpenseIcon(expenseType)}
                                                                <span className="font-medium text-xs md:text-sm">
                                                                    {ExpenseTypeLabels[expenseType]}
                                                                </span>
                                                            </div>
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Informações da Despesa */}
                                                <div className="space-y-3 mb-4 flex-1">
                                                    {/* Nome da Despesa e Descrição */}
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <Receipt className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium text-gray-900 text-base truncate">
                                                                    {outflow.expenseName}
                                                                </h3>
                                                            </div>
                                                        </div>

                                                        {/* DESCRIÇÃO AGORA VEM DIRETO DO outflow.description */}
                                                        {outflow.description && outflow.description.trim() !== '' && (
                                                            <div className="mt-2 pl-7">
                                                                <div className="flex items-start gap-2">
                                                                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                                        {outflow.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Método de Pagamento e Detalhes */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Método de Pagamento */}
                                                        <div className="bg-blue-50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <CreditCard className="w-4 h-4 text-blue-500" />
                                                                <span className="text-xs font-medium text-blue-700">Pagamento</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(outflow.paymentMethod)}
                                                                <span className="text-sm font-medium text-gray-900 truncate">
                                                                    {PaymentMethodLabels[outflow.paymentMethod]}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Parcelamento ou Status */}
                                                        {isInstallment ? (
                                                            <div className="bg-purple-50 rounded-lg p-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Divide className="w-4 h-4 text-purple-500" />
                                                                        <span className="text-xs font-medium text-purple-700">Parcela</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-gray-900">
                                                                        {outflow.currentInstallment}/{outflow.totalInstallments}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                                                        style={{ width: `${(outflow.currentInstallment! / outflow.totalInstallments!) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                                    <span>{remainingInstallments} restante{remainingInstallments !== 1 ? 's' : ''}</span>
                                                                    <span>{Math.round((outflow.currentInstallment! / outflow.totalInstallments!) * 100)}% pago</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-green-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign className="w-4 h-4 text-green-500" />
                                                                    <div>
                                                                        <div className="text-xs font-medium text-green-700">Status</div>
                                                                        <div className="text-sm font-medium text-gray-900">À vista</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Valor */}
                                                <div className="pt-4 border-t border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm md:text-base font-semibold text-gray-900">Valor</span>
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse hidden md:block"></div>
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xs md:text-sm text-red-500">R$</span>
                                                            <span className="text-lg md:text-xl font-bold text-red-600">
                                                                {outflow.amount.toLocaleString('pt-BR', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}