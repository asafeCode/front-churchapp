'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { CreateInflowRequest, ResponseInflowJson } from "../../models/inflow.model.ts";
import type { UserProfiles } from "../../models/user.model.ts";
import { InflowOrderBy, InflowType, OrderDirection, PaymentMethod } from "../../models/enums.ts";
import { inflowService } from "../../services/inflow.service.ts";
import { toast } from "sonner";
import { userService } from "../../services/user.service.ts";
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
import { Plus, Filter, X, Calendar, User, Music, ArrowUpDown, ChevronDown, ChevronUp, Church, Receipt, CreditCard, DollarSign } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../components/ui/input.tsx";
import { EnumSelect } from "../../components/ui/enum-select.tsx";
import {
    DayOfWeekLabels,
    InflowOrderByLabels,
    InflowTypeLabels,
    OrderDirectionLabels,
    PaymentMethodLabels
} from "../../models/enum-labels.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { worshipService } from "../../services/worship.service.ts";
import type { ResponseWorship } from "../../models/worship.model.ts";
import { Badge } from "../../components/ui/badge.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";

export default function Inflows() {
    const [inflows, setInflows] = useState<ResponseInflowJson[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [members, setMembers] = useState<UserProfiles[]>([]);
    const [worships, setWorships] = useState<ResponseWorship[]>([]);
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

    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        memberId: 'all',
        worshipId: 'all',
        amountRange: 'all',
        orderBy: InflowOrderBy.DATA,
        orderDirection: OrderDirection.DECRESCENTE,
    });

    // Gerar datas com base no mês/ano selecionado
    const getDateRange = (month: number, year: number) => {
        const initialDate = new Date(year, month, 1);
        const finalDate = new Date(year, month + 1, 0);

        return {
            InitialDate: format(initialDate, 'yyyy-MM-dd'),
            FinalDate: format(finalDate, 'yyyy-MM-dd'),
        };
    };

    const [formData, setFormData] = useState<CreateInflowRequest>({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: InflowType.DIZIMO,
        paymentMethod: PaymentMethod.FISICO,
        amount: 0,
        description: '',
        worshipId: undefined,
        userId: undefined,
    });

    /* ===================== LOAD ===================== */

    useEffect(() => {
        loadInflows();
        loadMembers();
        loadWorships();
    }, [filters]);

    const loadInflows = async () => {
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
            const response = await inflowService.getInflows({
                ...dateRange,
                MemberId: filters.memberId === 'all' ? undefined : filters.memberId,
                WorshipId: filters.worshipId === 'all' ? undefined : filters.worshipId,
                AmountMin: filters.amountRange === 'all' ? undefined : amountMin,
                AmountMax: filters.amountRange === 'all' ? undefined : amountMax,
                OrderBy: filters.orderBy,
                OrderDirection: filters.orderDirection,
            });

            setInflows(response.inflows);
            setTotalAmount(response.totalAmount);

        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        const response = await userService.getAllUsers();
        setMembers(response.users);
    };

    const loadWorships = async () => {
        const response = await worshipService.getWorships();
        setWorships(response.worships);
    };

    /* ===================== FILTERS ===================== */

    const handleClearFilters = () => {
        setFilters({
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            memberId: 'all',
            worshipId: 'all',
            amountRange: 'all',
            orderBy: InflowOrderBy.DATA,
            orderDirection: OrderDirection.DECRESCENTE,
        });
        toast.info("Filtros limpos");
    };

    const hasActiveFilters = () => {
        return filters.memberId !== 'all' ||
            filters.worshipId !== 'all' ||
            filters.amountRange !== 'all' ||
            filters.orderBy !== InflowOrderBy.DATA ||
            filters.orderDirection !== OrderDirection.DECRESCENTE;
    };

    const getMonthName = (monthIndex: number) => {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return monthNames[monthIndex];
    };

    const getSelectedMemberName = () => {
        if (filters.memberId === 'all') return 'Todos';
        const member = members.find(m => m.id === filters.memberId);
        return member?.name || 'Membro não encontrado';
    };

    const getSelectedWorshipName = () => {
        if (filters.worshipId === 'all') return 'Todos';
        const worship = worships.find(w => w.id === filters.worshipId);
        return worship ? `${DayOfWeekLabels[worship.dayOfWeek]} | ${worship.time}` : 'Culto não encontrado';
    };

    const getAmountRangeLabel = () => {
        const preset = amountPresets.find(p => p.value === filters.amountRange);
        return preset?.label || 'Todos os valores';
    };

    const getInflowTypeIcon = (type: InflowType) => {
        switch(type) {
            case InflowType.DIZIMO:
                return <Church className="w-4 h-4 text-green-600" />;
            case InflowType.OFERTA:
                return <DollarSign className="w-4 h-4 text-blue-500" />;
            default:
                return <Receipt className="w-4 h-4 text-green-400" />;
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch(method) {
            case PaymentMethod.FISICO:
                return <DollarSign className="w-4 h-4 text-green-500" />;
            case PaymentMethod.DIGITAL:
                return <CreditCard className="w-4 h-4 text-blue-400" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-500" />;
        }
    };

    const getInflowTypeColor = (type: InflowType) => {
        switch(type) {
            case InflowType.DIZIMO:
                return 'bg-green-50 text-green-700 border-green-200';
            case InflowType.OFERTA:
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    /* ===================== CREATE ===================== */

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        await inflowService.createInflow({
            ...formData,
            amount: Number(formData.amount),
            userId: formData.userId ?? null,
            worshipId: formData.worshipId ?? undefined,
        });

        toast.success('Entrada criada com sucesso');
        setOpenCreate(false);
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            type: InflowType.DIZIMO,
            paymentMethod: PaymentMethod.FISICO,
            amount: 0,
            description: '',
            worshipId: undefined,
            userId: undefined,
        });

        loadInflows();
    };

    /* ===================== RENDER ===================== */

    return (
        <DashboardLayout>
            <div className="space-y-6 mt-4">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-4xl font-heading font-semibold text-gray-900">
                            Entradas
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Gerencie as entradas financeiras
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
                                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">Nova Entrada</span>
                                    <span className="md:hidden">Nova</span>
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Criar Entrada</DialogTitle>
                                    <DialogDescription>
                                        Adicione uma nova entrada financeira
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
                                            <Label className="text-gray-700">Tipo</Label>
                                            <EnumSelect
                                                value={formData.type}
                                                labels={InflowTypeLabels}
                                                onChange={(type) =>
                                                    setFormData({...formData, type})
                                                }
                                                placeholder="Selecione o tipo"
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

                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Valor</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        amount: Number(e.target.value),
                                                    })
                                                }
                                                required
                                                className="border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Membro</Label>
                                        <Select
                                            value={formData.userId ?? 'none'}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    userId: value === 'none' ? undefined : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="border-gray-300">
                                                <SelectValue placeholder="Selecione um membro"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Nenhum</SelectItem>
                                                {members.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Culto</Label>
                                        <Select
                                            value={formData.worshipId ?? 'none'}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    worshipId: value === 'none' ? undefined : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="border-gray-300">
                                                <SelectValue placeholder="Selecione um culto"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Nenhum</SelectItem>
                                                {worships.map((worship) => (
                                                    <SelectItem key={worship.id} value={worship.id}>
                                                        {DayOfWeekLabels[worship.dayOfWeek]} | {worship.time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

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

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        Criar Entrada
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* CARD DE RESUMO DO MÊS/ANO */}
                <Card className="bg-green-100 border-emerald-50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="text-lg font-semibold text-green-900">
                                    {getMonthName(filters.month)} {filters.year}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Período selecionado
                                </p>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-sm text-gray-600">Valor total</p>
                                <p className="text-2xl md:text-3xl font-bold text-green-600">
                                    R$ {totalAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {inflows.length} {inflows.length === 1 ? 'entrada' : 'entradas'}
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
                                    {filters.memberId !== 'all' && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <User className="w-3 h-3 mr-1" />
                                            {getSelectedMemberName()}
                                        </Badge>
                                    )}
                                    {filters.worshipId !== 'all' && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <Music className="w-3 h-3 mr-1" />
                                            {getSelectedWorshipName()}
                                        </Badge>
                                    )}
                                    {filters.amountRange !== 'all' && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Valor: {getAmountRangeLabel()}
                                        </Badge>
                                    )}
                                    {filters.orderBy !== InflowOrderBy.DATA && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <ArrowUpDown className="w-3 h-3 mr-1" />
                                            Ordenado por: {InflowOrderByLabels[filters.orderBy]}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                                {/* MEMBRO */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Membro</Label>
                                    <Select
                                        value={filters.memberId}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, memberId: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue>
                                                {filters.memberId === 'all' ? 'Todos os membros' : getSelectedMemberName()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os membros</SelectItem>
                                            {members.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* CULTO */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Culto</Label>
                                    <Select
                                        value={filters.worshipId}
                                        onValueChange={(value) =>
                                            setFilters({ ...filters, worshipId: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue>
                                                {filters.worshipId === 'all' ? 'Todos os cultos' : getSelectedWorshipName()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os cultos</SelectItem>
                                            {worships.map((worship) => (
                                                <SelectItem key={worship.id} value={worship.id}>
                                                    {DayOfWeekLabels[worship.dayOfWeek]} | {worship.time}
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

                                {/* ORDENAÇÃO */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-gray-700">Ordenar por</Label>
                                        <EnumSelect
                                            value={filters.orderBy}
                                            labels={InflowOrderByLabels}
                                            onChange={(value) =>
                                                setFilters({ ...filters, orderBy: value })
                                            }
                                            placeholder="Ordenar por"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm text-gray-700">Direção</Label>
                                        <EnumSelect
                                            value={filters.orderDirection}
                                            labels={OrderDirectionLabels}
                                            onChange={(value) =>
                                                setFilters({ ...filters, orderDirection: value })
                                            }
                                            placeholder="Direção"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* LISTA DE ENTRADAS */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : inflows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhuma entrada encontrada
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {hasActiveFilters()
                                        ? "Tente ajustar os filtros ou limpar para ver todas as entradas"
                                        : `Não há entradas registradas para ${getMonthName(filters.month)} ${filters.year}`}
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
                                {inflows.map((inflow) => (
                                    <Card key={inflow.id} className="bg-white border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-medium text-lg text-gray-900">
                                                        {format(new Date(inflow.date), 'dd/MM/yyyy')}
                                                    </div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                        <Church className="w-3 h-3 text-gray-400" />
                                                        {inflow.worshipInfo || '—'}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant="outline" className={`${getInflowTypeColor(inflow.inflowType)} flex items-center gap-1`}>
                                                        {getInflowTypeIcon(inflow.inflowType)}
                                                        {InflowTypeLabels[inflow.inflowType]}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        {getPaymentMethodIcon(inflow.paymentMethod)}
                                                        {PaymentMethodLabels[inflow.paymentMethod]}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm text-gray-600">Membro</span>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <span className="font-medium text-gray-900">{inflow.memberName || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900">Valor</span>
                                                    <span className="font-mono font-bold text-lg text-green-600">
                                                        R$ {inflow.amount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}