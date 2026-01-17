'use client';

import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import type {CreateInflowRequest, ResponseInflowJson} from "../../models/inflow.model.ts";
import type {UserProfiles} from "../../models/user.model.ts";
import {InflowOrderBy, InflowType, OrderDirection, PaymentMethod} from "../../models/enums.ts";
import {inflowService} from "../../services/inflow.service.ts";
import {toast} from "sonner";
import {userService} from "../../services/user.service.ts";
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
    Plus,
    Filter,
    X,
    Calendar,
    User,
    Music,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Church,
    Receipt,
    CreditCard,
    DollarSign,
    FileText, CalendarHeart, CalendarClock, CalendarX
} from "lucide-react";
import {Label} from "@radix-ui/react-label";
import {Input} from "../../components/ui/input.tsx";
import {EnumSelect} from "../../components/ui/enum-select.tsx";
import {
    DayOfWeekLabels,
    InflowOrderByLabels,
    InflowTypeLabels,
    OrderDirectionLabels,
    PaymentMethodLabels
} from "../../models/enum-labels.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select.tsx";
import {Card, CardContent} from "../../components/ui/card.tsx";
import {worshipService} from "../../services/worship.service.ts";
import type {ResponseWorship} from "../../models/worship.model.ts";
import {Badge} from "../../components/ui/badge.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {MoneyInput} from "../../components/ui/money-input.tsx";
import {ptBR} from "date-fns/locale";

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
        {value: 'all', label: 'Todos os valores'},
        {value: '0-100', label: 'Até R$ 100'},
        {value: '100-500', label: 'R$ 100 - 500'},
        {value: '500-1000', label: 'R$ 500 - 1.000'},
        {value: '1000+', label: 'Acima de R$ 1.000'}
    ];

    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        inflowType: InflowType.TODOS,
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
            EndDate: format(finalDate, 'yyyy-MM-dd'),
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
                Type: filters.inflowType === InflowType.TODOS ? undefined : filters.inflowType,
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
            inflowType: InflowType.TODOS,
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
            filters.inflowType !== InflowType.TODOS ||
            filters.worshipId !== 'all' ||
            filters.amountRange !== 'all' ||
            filters.orderBy !== InflowOrderBy.DATA ||
            filters.orderDirection !== OrderDirection.DECRESCENTE;
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
        switch (type) {
            case InflowType.DIZIMO:
                return <Church className="w-4 h-4 text-green-600"/>;
            case InflowType.OFERTA:
                return <DollarSign className="w-4 h-4 text-blue-500"/>;
            default:
                return <Receipt className="w-4 h-4 text-green-400"/>;
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.FISICO:
                return <DollarSign className="w-4 h-4 text-green-500"/>;
            case PaymentMethod.DIGITAL:
                return <CreditCard className="w-4 h-4 text-blue-400"/>;
            default:
                return <DollarSign className="w-4 h-4 text-gray-500"/>;
        }
    };

    const getInflowTypeColor = (type: InflowType) => {
        switch (type) {
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
                            <Filter className="w-4 h-4"/>
                            {showFilters ? (
                                <>
                                    <ChevronUp className="w-4 h-4"/>
                                    <span className="hidden sm:inline">Ocultar Filtros</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4"/>
                                    <span className="hidden sm:inline">Mostrar Filtros</span>
                                </>
                            )}
                        </Button>

                        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="w-4 h-4"/>
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
                                            <MoneyInput
                                                value={
                                                    formData.amount
                                                        ? String(formData.amount)
                                                        : ""
                                                }
                                                onChange={(value) =>
                                                    setFormData({
                                                        ...formData,
                                                        amount: Number(value)
                                                    })
                                                }
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
                            <div
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500"/>
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
                                                <ChevronUp className="w-3 h-3 mr-1"/>
                                                Ocultar
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-3 h-3 mr-1"/>
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
                                            <X className="w-3 h-3 mr-1"/>
                                            Limpar filtros
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {hasActiveFilters() && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {filters.memberId !== 'all' && (
                                        <Badge variant="outline"
                                               className="bg-green-50 text-green-700 border-green-200">
                                            <User className="w-3 h-3 mr-1"/>
                                            {getSelectedMemberName()}
                                        </Badge>
                                    )}
                                    {filters.worshipId !== 'all' && (
                                        <Badge variant="outline"
                                               className="bg-green-50 text-green-700 border-green-200">
                                            <Music className="w-3 h-3 mr-1"/>
                                            {getSelectedWorshipName()}
                                        </Badge>
                                    )}
                                    {filters.amountRange !== 'all' && (
                                        <Badge variant="outline"
                                               className="bg-green-50 text-green-700 border-green-200">
                                            Valor: {getAmountRangeLabel()}
                                        </Badge>
                                    )}
                                    {filters.orderBy !== InflowOrderBy.DATA && (
                                        <Badge variant="outline"
                                               className="bg-green-50 text-green-700 border-green-200">
                                            <ArrowUpDown className="w-3 h-3 mr-1"/>
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
                                            setFilters({...filters, month: Number(value)})
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
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
                                            setFilters({...filters, year: Number(value)})
                                        }
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

                                {/* MEMBRO */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Membro</Label>
                                    <Select
                                        value={filters.memberId}
                                        onValueChange={(value) =>
                                            setFilters({...filters, memberId: value})
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
                                            setFilters({...filters, worshipId: value})
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

                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Tipo</Label>
                                        <EnumSelect
                                            value={filters.inflowType}
                                            labels={InflowTypeLabels}
                                            onChange={(type) =>
                                                setFilters({...filters, inflowType: type})
                                            }
                                            placeholder="Selecione o tipo"
                                        />
                                    </div>
                                </div>

                                {/* PRESET DE VALOR */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-700">Faixa de Valor</Label>
                                    <Select
                                        value={filters.amountRange}
                                        onValueChange={(value) =>
                                            setFilters({...filters, amountRange: value})
                                        }
                                    >
                                        <SelectTrigger className="w-full border-gray-300">
                                            <SelectValue/>
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
                                                setFilters({...filters, orderBy: value})
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
                                                setFilters({...filters, orderDirection: value})
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
                    <CardContent className="p-3 md:p-4 lg:p-6">
                        {loading ? (
                            <div className="space-y-3 md:space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-28 md:h-32 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : inflows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[350px] text-center p-4 md:p-6"
                                 data-testid="empty-inflows-state">
                                <div className="relative mb-4 md:mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                                        <Calendar className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center">
                                        <CalendarX className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                    Nenhuma entrada encontrada
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base max-w-md mb-4 md:mb-6">
                                    {hasActiveFilters()
                                        ? "Tente ajustar os filtros para encontrar entradas registradas"
                                        : `Não há entradas registradas para ${getMonthName(filters.month)} ${filters.year}`}
                                </p>
                                {hasActiveFilters() && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        size="sm"
                                        className="gap-1 md:gap-2 text-xs md:text-sm border-gray-300 hover:border-gray-400"
                                    >
                                        <X className="w-3 h-3 md:w-4 md:h-4" />
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                                {inflows.map((inflow) => {
                                    const formattedDate = new Date(inflow.date);
                                    const isToday = isTodayDate(formattedDate);
                                    const isRecent = isRecentDate(formattedDate, 7);

                                    return (
                                        <div
                                            key={inflow.id}
                                            className="group bg-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4 lg:p-5 hover:border-green-300 hover:shadow-md transition-all duration-300"
                                            data-testid="inflow-card"
                                        >
                                            {/* Header - Mais compacto */}
                                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className={`p-1.5 md:p-2 rounded ${isToday ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        {isToday ? (
                                                            <CalendarHeart className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                                        ) : isRecent ? (
                                                            <CalendarClock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                                        ) : (
                                                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                    <span className="font-semibold text-gray-900 text-sm md:text-base">
                      {format(formattedDate, 'dd/MM/yyyy')}
                    </span>
                                                            {isToday && (
                                                                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full w-fit">
                        Hoje
                      </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                                                            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                            {format(formattedDate, 'EEE', { locale: ptBR })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tipo de entrada - tamanho ajustado */}
                                                <Badge className={`${getInflowTypeColor(inflow.inflowType)} font-medium px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm`}>
                                                    <div className="flex items-center gap-1 md:gap-1.5">
                                                        {getInflowTypeIcon(inflow.inflowType)}
                                                        <span className="truncate max-w-[60px] md:max-w-none">
                    {InflowTypeLabels[inflow.inflowType]}
                  </span>
                                                    </div>
                                                </Badge>
                                            </div>

                                            {/* Informações principais - mais compactas */}
                                            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                                                {/* Descrição */}
                                                <div className="bg-gray-50 rounded p-2 md:p-3">
                                                    <div className="flex items-start gap-1.5 md:gap-2">
                                                        <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs md:text-sm text-gray-600 font-medium mb-0.5 md:mb-1">Descrição</p>
                                                            <p className="text-gray-900 text-sm truncate md:line-clamp-1" title={inflow.description || "Sem descrição"}>
                                                                {inflow.description || "Sem descrição"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Culto e Membro - em linha no mobile */}
                                                <div className="flex md:grid md:grid-cols-2 gap-2 md:gap-3">
                                                    <div className="flex-1 md:flex-none bg-blue-50 rounded p-2 md:p-3">
                                                        <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                            <Church className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                                            <span className="text-xs font-medium text-blue-700">Culto</span>
                                                        </div>
                                                        <p className="text-xs md:text-sm text-gray-900 font-medium truncate" title={inflow.worshipInfo}>
                                                            {inflow.worshipInfo || "Não informado"}
                                                        </p>
                                                    </div>

                                                    <div className="flex-1 md:flex-none bg-purple-50 rounded p-2 md:p-3">
                                                        <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                                                            <span className="text-xs font-medium text-purple-700">Membro</span>
                                                        </div>
                                                        <p className="text-xs md:text-sm text-gray-900 font-medium truncate" title={inflow.memberName}>
                                                            {inflow.memberName || "Não informado"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Método de pagamento */}
                                                <div className="flex items-center justify-between bg-gray-50 rounded p-2 md:p-3">
                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                        {getPaymentMethodIcon(inflow.paymentMethod)}
                                                        <span className="text-xs md:text-sm text-gray-600 truncate">Pagamento</span>
                                                    </div>
                                                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate ml-2">
                  {PaymentMethodLabels[inflow.paymentMethod]}
                </span>
                                                </div>
                                            </div>

                                            {/* Valor - mais compacto */}
                                            <div className="pt-2 md:pt-3 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                        <span className="text-xs md:text-sm text-gray-600">Valor</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse hidden md:block"></div>
                                                    </div>
                                                    <div className="flex items-baseline gap-0.5 md:gap-1">
                                                        <span className="text-xs md:text-sm text-gray-500">R$</span>
                                                        <span className="text-lg md:text-xl lg:text-2xl font-bold text-green-600 md:bg-gradient-to-r md:from-green-600 md:to-emerald-600 md:bg-clip-text md:text-transparent">
                    {inflow.amount.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                  </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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