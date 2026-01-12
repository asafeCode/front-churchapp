'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { CreateOutflowRequest, ResponseShortOutflow } from "../../models/outflow.model.ts";
import { PaymentMethod } from "../../models/enums.ts";
import { outflowService } from "../../services/outflow.service.ts";
import { expenseService } from "../../services/expense.service.ts";
import { toast } from "sonner";
import { DashboardLayout } from "../../components/layout/DashboardLayout.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Plus, Filter, X, Calendar, Receipt, ChevronDown, ChevronUp, CreditCard, DollarSign, TrendingDown } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../components/ui/input.tsx";
import { EnumSelect } from "../../components/ui/enum-select.tsx";
import {
    PaymentMethodLabels,
    ExpenseTypeLabels
} from "../../models/enum-labels.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import type { ResponseExpenseJson } from "../../models/expense.model.ts";
import { ExpenseType } from "../../models/enums.ts";

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

    // Filtros atualizados com presets
    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        expenseId: 'all',
        amountRange: 'all',
    });

    // Gerar datas com base no mês/ano selecionado
    const getDateRange = (month: number, year: number) => {
        const initialDate = new Date(year, month, 1);
        const finalDate = new Date(year, month + 1, 0);

        return {
            dataInicial: format(initialDate, 'yyyy-MM-dd'),
            dataFinal: format(finalDate, 'yyyy-MM-dd'),
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
            amountRange: 'all',
        });
        toast.info("Filtros limpos");
    };

    const hasActiveFilters = () => {
        return filters.expenseId !== 'all' ||
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

    const getExpenseIcon = (expenseType?: ExpenseType) => {
        switch(expenseType) {
            case ExpenseType.PARCELADA:
                return <CreditCard className="w-4 h-4 text-red-500" />;
            case ExpenseType.FIXA:
                return <DollarSign className="w-4 h-4 text-red-600" />;
            case ExpenseType.VARIAVEL:
                return <TrendingDown className="w-4 h-4 text-red-400" />;
            default:
                return <Receipt className="w-4 h-4 text-gray-500" />;
        }
    };

    const getExpenseColor = (expenseType?: ExpenseType) => {
        switch(expenseType) {
            case ExpenseType.PARCELADA:
                return 'bg-red-100 text-red-800 border-red-200';
            case ExpenseType.FIXA:
                return 'bg-red-50 text-red-700 border-red-100';
            case ExpenseType.VARIAVEL:
                return 'bg-red-200 text-red-900 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800';
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

                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={
                                                    isParcelada
                                                        ? selectedExpense?.amountOfEachInstallment ?? 0
                                                        : formData.amount
                                                }
                                                disabled={isParcelada}
                                                onChange={(e) => {
                                                    if (isParcelada) return;

                                                    setFormData({
                                                        ...formData,
                                                        amount: Number(e.target.value),
                                                    });
                                                }}
                                                required={!isParcelada}
                                                className="border-gray-300"
                                            />

                                            {isParcelada && (
                                                <p className="text-sm text-gray-500">
                                                    Esta é uma despesa parcelada. Para alterar o valor da parcela,
                                                    edite a despesa em{' '}
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
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-medium text-gray-900">Filtros</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="md:hidden text-gray-600 hover:text-gray-900"
                                    >
                                        {showFilters ? (
                                            <>
                                                <ChevronUp className="w-3 h-3 mr-1" />
                                                Ocultar
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-3 h-3 mr-1" />
                                                Mostrar
                                            </>
                                        )}
                                    </Button>

                                    {hasActiveFilters() && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Limpar filtros
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {hasActiveFilters() && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {filters.expenseId !== 'all' && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <Receipt className="w-3 h-3 mr-1" />
                                            {getSelectedExpenseName()}
                                        </Badge>
                                    )}
                                    {filters.amountRange !== 'all' && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            Valor: {getAmountRangeLabel()}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* MÊS */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Mês</Label>
                                    <Select
                                        value={filters.month.toString()}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, month: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
                                            ].map((month, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {month}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ANO */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Ano</Label>
                                    <Select
                                        value={filters.year.toString()}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, year: Number(value) })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue />
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

                                {/* DESPESA */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Despesa</Label>
                                    <Select
                                        value={filters.expenseId}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, expenseId: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue>
                                                {filters.expenseId === 'all' ? 'Todas as despesas' : getSelectedExpenseName()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas as despesas</SelectItem>
                                            {expenses.map((expense) => (
                                                <SelectItem key={expense.id} value={expense.id}>
                                                    {expense.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* PRESET DE VALOR */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Faixa de Valor</Label>
                                    <Select
                                        value={filters.amountRange}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, amountRange: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {amountPresets.map((preset) => (
                                                <SelectItem key={preset.value} value={preset.value}>
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
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : outflows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhuma saída encontrada
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {hasActiveFilters()
                                        ? "Tente ajustar os filtros ou limpar para ver todas as saídas"
                                        : `Não há saídas registradas para ${getMonthName(filters.month)} ${filters.year}`}
                                </p>
                                {hasActiveFilters() && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        className="mt-2"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {outflows.map((outflow) => {
                                    const expense = expenses.find(e => e.id === outflow.id);
                                    return (
                                        <Card key={outflow.id} className="bg-white border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-medium text-lg text-gray-900">
                                                            {format(new Date(outflow.date), 'dd/MM/yyyy')}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {outflow.expenseName || '—'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge variant="outline" className={`${getExpenseColor(expense?.expenseType)} flex items-center gap-1`}>
                                                            {getExpenseIcon(expense?.expenseType)}
                                                            {expense?.expenseType ? ExpenseTypeLabels[expense.expenseType] : 'Despesa'}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            {getPaymentMethodIcon(outflow.paymentMethod)}
                                                            {PaymentMethodLabels[outflow.paymentMethod]}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {outflow.currentInstallment && (
                                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                            <span className="text-sm text-gray-600">Parcela</span>
                                                            <span className="font-medium text-gray-900">
                                                                {outflow.currentInstallment}/{outflow.totalInstallments}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900">Valor</span>
                                                        <span className="font-mono font-bold text-lg text-red-600">
                                                            R$ {outflow.amount.toFixed(2)}
                                                        </span>
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