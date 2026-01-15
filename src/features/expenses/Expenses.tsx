'use client';

import React, {useEffect, useState} from 'react';
import {ExpenseType} from '../../models/enums.ts';
import {expenseService} from '../../services/expense.service.ts';
import {toast} from 'sonner';
import {DashboardLayout} from '../../components/layout/DashboardLayout.tsx';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '../../components/ui/dialog.tsx';
import {Button} from '../../components/ui/button.tsx';
import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    CreditCard,
    DollarSign,
    Edit,
    Filter,
    Plus,
    Receipt,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react';
import {Label} from '@radix-ui/react-label';
import {Input} from '../../components/ui/input.tsx';
import {EnumSelect} from '../../components/ui/enum-select.tsx';
import {ExpenseTypeLabels} from '../../models/enum-labels.ts';
import {Card, CardContent} from '../../components/ui/card.tsx';
import {Badge} from '../../components/ui/badge.tsx';
import {Skeleton} from '../../components/ui/skeleton.tsx';
import type {ExpenseFormData, ResponseExpenseJson, ResponseExpensesJson} from '../../models/expense.model.ts';

export default function Expenses() {
    const [expenses, setExpenses] = useState<ResponseExpensesJson>({expenses: []});
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [filterType, setFilterType] = useState<ExpenseType | string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingExpense, setEditingExpense] = useState<ResponseExpenseJson | null> (null);
    const [openEdit, setOpenEdit] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [formData, setFormData] = useState<ExpenseFormData>({
        name: '',
        type: ExpenseType.FIXA,
        totalInstallments: 0,
        currentInstallment: 0,
        amountOfEachInstallment: 0,
    });

    /* ===================== LOAD ===================== */
    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getExpenses();
            setExpenses(response);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== CREATE ===================== */
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        await expenseService.createExpense(formData);
        toast.success('Despesa criada com sucesso');
        setOpenCreate(false);
        setFormData({
            name: '',
            type: ExpenseType.FIXA,
            totalInstallments: 0,
            currentInstallment: 0,
            amountOfEachInstallment: 0,
        });
        loadExpenses();
    };

    /* ===================== UPDATE ===================== */
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;

        await expenseService.updateExpense(editingExpense.id, formData);
        toast.success('Despesa atualizada com sucesso');
        setOpenEdit(false);

        setEditingExpense(null);
        setFormData({
            name: '',
            type: ExpenseType.PARCELADA,
            totalInstallments: 0,
            currentInstallment: 0,
            amountOfEachInstallment: 0
        });
        loadExpenses();
    };

    /* ===================== DELETE ===================== */
    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            await expenseService.deleteExpense(id);
            toast.success('Despesa excluída com sucesso');
            loadExpenses();
        }
    };

    /* ===================== FILTERS ===================== */
    const filteredExpenses = expenses.expenses.filter(expense => {
        const matchesType = filterType === 'all' || expense.expenseType === Number(filterType);
        const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getExpenseColor = (type: ExpenseType) => {
        switch(type) {
            case ExpenseType.PARCELADA:
                return 'bg-white border-l-blue-600 border-l-4';
            case ExpenseType.FIXA:
                return 'bg-white border-l-green-500 border-l-4';
            case ExpenseType.VARIAVEL:
                return 'bg-white border-l-amber-400 border-l-4';
            default:
                return 'bg-white border-l-gray-300 border-l-4';
        }
    };

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

    const handleEditClick = (expense: ResponseExpenseJson) => {
        setEditingExpense(expense);
        setFormData({
            name: expense.name,
            type: expense.expenseType,
            totalInstallments: expense.expenseType === ExpenseType.PARCELADA ? expense.totalInstallments ?? 1 : null,
            currentInstallment:  1,
            amountOfEachInstallment: 1
        });
        setOpenEdit(true);
    };

    const handleClearFilters = () => {
        setFilterType('all');
        setSearchTerm('');
    };

    const hasFilters = filterType !== 'all' || searchTerm.trim() !== '';

    /* ===================== RENDER ===================== */
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-semibold text-gray-900">Despesas</h1>
                        <p className="text-gray-600">Gerencie as despesas financeiras</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => setShowFilters(!showFilters)}
                            variant="outline"
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

                        <Button
                            onClick={() => setOpenCreate(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2"/>
                            <span className="hidden sm:inline">Nova Despesa</span>
                            <span className="sm:hidden">Nova</span>
                        </Button>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4 pl-6 pr-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Despesas</p>
                                    <p className="text-2xl font-bold text-gray-900">{expenses.expenses.length}</p>
                                </div>
                                <div className="p-3 rounded-full bg-red-50">
                                    <Receipt className="w-6 h-6 text-red-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4  pl-6 pr-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Fixas</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {expenses.expenses.filter(e => e.expenseType === ExpenseType.FIXA).length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-50">
                                    <DollarSign className="w-6 h-6 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4  pl-6 pr-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Parceladas</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {expenses.expenses.filter(e => e.expenseType === ExpenseType.PARCELADA).length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-50">
                                    <CreditCard className="w-6 h-6 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4  pl-6 pr-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Variáveis</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {expenses.expenses.filter(e => e.expenseType === ExpenseType.VARIAVEL).length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-amber-50">
                                    <TrendingUp className="w-6 h-6 text-amber-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* FILTERS - Responsive */}
                <div className={`${showFilters ? 'block' : 'hidden'}`}>
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-medium text-gray-900">Filtros</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    {hasFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Limpar
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                        Buscar por nome
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Digite para buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">
                                        Tipo de despesa
                                    </Label>
                                    <EnumSelect
                                        value={Number(filterType) as ExpenseType}
                                        labels={{
                                            [ExpenseType.FIXA]: ExpenseTypeLabels[ExpenseType.FIXA],
                                            [ExpenseType.PARCELADA]: ExpenseTypeLabels[ExpenseType.PARCELADA],
                                            [ExpenseType.VARIAVEL]: ExpenseTypeLabels[ExpenseType.VARIAVEL],
                                        }}
                                        onChange={(type) => setFilterType(type)}
                                        placeholder="Filtrar por tipo"
                                    />
                                </div>
                            </div>

                            {hasFilters && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
                                            Busca: "{searchTerm}"
                                        </Badge>
                                    )}
                                    {filterType !== 'all' && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Tipo: {ExpenseTypeLabels[Number(filterType) as ExpenseType]}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* EXPENSES LIST */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-16 flex-1 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Receipt className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {hasFilters ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa cadastrada'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {hasFilters
                                        ? "Tente ajustar os filtros ou limpar para ver todas as despesas"
                                        : "Comece criando sua primeira despesa"}
                                </p>
                                <Button
                                    onClick={() => setOpenCreate(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Primeira Despesa
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredExpenses.map((expense) => (
                                    <Card
                                        key={expense.id}
                                        className={`hover:shadow-md transition-shadow duration-200 ${getExpenseColor(expense.expenseType)}`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-gray-50">
                                                        {getExpenseIcon(expense.expenseType)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`mt-1 text-xs ${getExpenseBadgeColor(expense.expenseType)}`}
                                                        >
                                                            {ExpenseTypeLabels[expense.expenseType]}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(expense)}
                                                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {expense.expenseType === ExpenseType.PARCELADA && expense.totalInstallments != null && expense.totalInstallments > 0 && (
                                                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                                        <span className="text-sm text-blue-700 font-medium">Parcela: R${expense.amountOfEachInstallment}</span>
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                                            {expense.currentInstallment} | {expense.totalInstallments} parcela{ expense.totalInstallments > 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className="pt-3 border-t border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Status</span>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-sm text-gray-700">Ativa</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CREATE DIALOG */}
                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-gray-900">
                                <Plus className="w-5 h-5 text-green-600" />
                                Nova Despesa
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Adicione uma nova categoria de despesa para controle financeiro
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700">Nome da Despesa</Label>
                                <Input
                                    placeholder="Ex: Aluguel, Conta de Luz, Mensalidade..."
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({...formData, name: e.target.value})
                                    }
                                    required
                                    className="border-gray-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Tipo de Despesa</Label>
                                <EnumSelect
                                    value={formData.type}
                                    labels={ExpenseTypeLabels}
                                    onChange={(type) => {
                                        setFormData({
                                            ...formData,
                                            type,
                                            totalInstallments: type === ExpenseType.PARCELADA ? 1 : 0,
                                        });
                                    }}
                                    placeholder="Selecione o tipo"
                                />
                            </div>

                            {formData.type === ExpenseType.PARCELADA && (
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Total de Parcelas</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        value={formData.totalInstallments ?? 1}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                totalInstallments: Number(e.target.value)
                                            })
                                        }
                                        required
                                        className="border-gray-300"
                                    />
                                    <Label className="text-gray-700">Parcela Atual</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.currentInstallment ?? 0}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                currentInstallment: Number(e.target.value)
                                            })
                                        }
                                        required
                                        className="border-gray-300"
                                    />
                                    <Label className="text-gray-700">Valor da Parcela</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={2}
                                        value={formData.amountOfEachInstallment ?? 1}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amountOfEachInstallment: Number(e.target.value)
                                            })
                                        }
                                        required
                                        className="border-gray-300"
                                    />
                                </div>


                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenCreate(false)}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Criar Despesa
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* EDIT DIALOG */}
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-gray-900">
                                <Edit className="w-5 h-5 text-green-600" />
                                Editar Despesa
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Atualize as informações da despesa selecionada
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700">Nome da Despesa</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({...formData, name: e.target.value})
                                    }
                                    required
                                    className="border-gray-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Tipo de Despesa</Label>
                                <EnumSelect
                                    value={formData.type}
                                    labels={ExpenseTypeLabels}
                                    onChange={(type) => {
                                        setFormData({
                                            ...formData,
                                            type,
                                            totalInstallments: type === ExpenseType.PARCELADA ? formData.totalInstallments ?? 1 : null,
                                        });
                                    }}
                                />
                            </div>

                            {formData.type === ExpenseType.PARCELADA && (
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Total de Parcelas</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.totalInstallments ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                totalInstallments: Number(e.target.value),
                                            })
                                        }
                                        required
                                        className="border-gray-300"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpenEdit(false);
                                        setEditingExpense(null);
                                    }}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}