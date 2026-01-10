"use client";

import { useEffect, useState } from "react";
import type { UserFilters, UserProfiles, UserProfileResponse } from "../../models/user.model.ts";
import { userService } from "../../services/user.service.ts";
import { toast } from "sonner";
import { UserRoleLabels } from "../../models/enum-labels.ts";
import { DashboardLayout } from "../../components/layout/DashboardLayout.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
    Search,
    ChevronDown,
    X,
    Phone,
    MapPin,
    Calendar,
    Droplets,
    Home,
    Briefcase,
    Gift,
    Cake,
    PartyPopper,
    Sparkles,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberWithDetails extends UserProfiles {
    details?: UserProfileResponse;
    detailsLoading?: boolean;
}

interface BirthdayMonthFilter {
    month: number;
    year: number;
}

export default function Birthdays() {
    const [members, setMembers] = useState<MemberWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const [search, setSearch] = useState<string>("");
    const [monthFilter, setMonthFilter] = useState<BirthdayMonthFilter>({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        loadBirthdayMembers();
    }, [monthFilter]);

    const loadBirthdayMembers = async (nameFilter?: string) => {
        try {
            setLoading(true);

            // Se houver busca por nome, não filtra por mês
            let filters: UserFilters = {};

            if (nameFilter && nameFilter.trim() !== "") {
                filters = { name: nameFilter.trim() };
            } else {
                // Se não há busca por nome, filtra pelo mês selecionado
                const response = await userService.getAllUsers({});

                // Filtra no frontend os que fazem aniversário no mês especificado
                const birthdayMembers = response.users.filter(user => {
                    if (!user.dateOfBirth) return false;

                    try {
                        const birthDate = parseISO(user.dateOfBirth);
                        const birthMonth = birthDate.getMonth() + 1;
                        return birthMonth === monthFilter.month;
                    } catch {
                        return false;
                    }
                });

                // Ordena por dia do mês
                const sortedMembers = birthdayMembers.sort((a, b) => {
                    const dateA = parseISO(a.dateOfBirth || '');
                    const dateB = parseISO(b.dateOfBirth || '');
                    return dateA.getDate() - dateB.getDate();
                });

                setMembers(sortedMembers.map(user => ({
                    ...user,
                    details: undefined,
                    detailsLoading: false
                })));
                return;
            }

            // Busca por nome
            const response = await userService.getAllUsers(filters);
            setMembers(response.users.map(user => ({
                ...user,
                details: undefined,
                detailsLoading: false
            })));

        } catch (error) {
            toast.error("Erro ao carregar aniversariantes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (id: string) => {
        const isExpanding = !expandedIds.has(id);

        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });

        if (isExpanding) {
            setMembers(prev => prev.map(member =>
                member.id === id
                    ? { ...member, detailsLoading: true }
                    : member
            ));

            try {
                const userDetails = await userService.getUserById(id);
                setMembers(prev => prev.map(member =>
                    member.id === id
                        ? {
                            ...member,
                            details: userDetails,
                            detailsLoading: false
                        }
                        : member
                ));
            } catch (error) {
                toast.error("Erro ao carregar detalhes do membro");
                console.error(error);
                setMembers(prev => prev.map(member =>
                    member.id === id
                        ? { ...member, detailsLoading: false }
                        : member
                ));
            }
        }
    };

    const formatDateSafe = (dateString?: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return '—';

        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return '—';
        }
    };

    const formatBirthday = (dateString?: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return '—';

        try {
            const date = parseISO(dateString);
            return format(date, "dd 'de' MMMM", { locale: ptBR });
        } catch {
            return '—';
        }
    };

    const getAge = (dateString?: string, forYear?: number) => {
        if (!dateString) return 0;

        try {
            const birthDate = parseISO(dateString);
            const today = new Date();
            const targetYear = forYear || today.getFullYear();

            let age = targetYear - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        } catch {
            return 0;
        }
    };

    const getCurrentAge = (dateString?: string) => {
        return getAge(dateString);
    };

    const getNextAge = (dateString?: string) => {
        if (!dateString) return 0;

        const birthDate = parseISO(dateString);
        const today = new Date();
        const currentYear = today.getFullYear();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();

        // Se já passou o aniversário este ano, próximo ano é ano que vem
        if (today.getMonth() > birthMonth ||
            (today.getMonth() === birthMonth && today.getDate() >= birthDay)) {
            return getAge(dateString, currentYear + 1);
        }

        // Se ainda não passou, próximo aniversário é este ano
        return getAge(dateString, currentYear);
    };

    const handleMonthChange = (increment: number) => {
        setMonthFilter(prev => {
            let newMonth = prev.month + increment;
            let newYear = prev.year;

            if (newMonth > 12) {
                newMonth = 1;
                newYear++;
            } else if (newMonth < 1) {
                newMonth = 12;
                newYear--;
            }

            return { month: newMonth, year: newYear };
        });
    };

    const handleSearch = () => {
        loadBirthdayMembers(search);
    };

    const handleClearFilters = () => {
        setSearch("");
        setMonthFilter({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        loadBirthdayMembers();
        toast.info("Filtros limpos");
    };

    const hasActiveFilters = search.trim() !== "";

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const getBirthdayCardStyle = (member: MemberWithDetails) => {
        const isTodayBirthday = member.dateOfBirth ? isToday(parseISO(member.dateOfBirth)) : false;

        if (isTodayBirthday) {
            return "bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 shadow-lg";
        }

        const age = getAge(member.dateOfBirth);
        if (age >= 60) {
            return "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200";
        }

        return "bg-white hover:shadow-md transition-shadow";
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 mt-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Cake className="w-8 h-8 text-pink-600" />
                            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-heading font-semibold">Aniversariantes</h1>
                            <p className="text-sm text-stone-500">Celebre com nossos membros</p>
                        </div>
                        <Badge variant="outline" className="text-sm bg-pink-50 text-pink-700 border-pink-200">
                            {members.length}
                        </Badge>
                    </div>
                </div>

                {/* Filtros e seleção de mês */}
                <Card className="border-pink-100">
                    <CardContent className="mt-6 md:mt-4 flex flex-col gap-4 md:grid md:grid-cols-12 md:items-end">
                        {/* Seleção de mês */}
                        <div className="w-full md:col-span-12 mb-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-stone-700 font-medium">Mês de Aniversário</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const today = new Date();
                                        setMonthFilter({
                                            month: today.getMonth() + 1,
                                            year: today.getFullYear()
                                        });
                                    }}
                                    className="text-sm text-pink-600"
                                >
                                    Mês atual
                                </Button>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleMonthChange(-1)}
                                    className="border-pink-200 hover:bg-pink-50"
                                >
                                    <ChevronDown className="w-4 h-4 rotate-90" />
                                </Button>

                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                                        {months[monthFilter.month - 1]}
                                    </div>
                                    <div className="text-sm text-stone-500">{monthFilter.year}</div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleMonthChange(1)}
                                    className="border-pink-200 hover:bg-pink-50"
                                >
                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                </Button>
                            </div>
                        </div>

                        {/* Busca por nome */}
                        <div className="w-full md:col-span-10">
                            <Label className="text-stone-700 font-medium">Buscar por nome</Label>
                            <div className="relative mt-1">
                                <Input
                                    placeholder="Digite o nome do aniversariante"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 w-full border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                                />
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                            </div>
                        </div>

                        <div className="w-full md:col-span-2">
                            <Button
                                onClick={handleSearch}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600"
                            >
                                <Search className="w-4 h-4" />
                                Buscar
                            </Button>
                        </div>

                        <div className="w-full md:col-span-12 flex justify-end">
                            <Button
                                onClick={handleClearFilters}
                                variant="ghost"
                                className="flex items-center justify-center gap-2 text-stone-600 hover:text-stone-800"
                                disabled={!hasActiveFilters}
                            >
                                <X className="w-4 h-4" />
                                Limpar busca
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de aniversariantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))
                    ) : members.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-stone-500 space-y-4">
                            <div className="relative inline-block">
                                <Cake className="mx-auto mb-2 w-16 h-16 text-stone-300" />
                                <PartyPopper className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
                            </div>
                            <div className="text-xl font-semibold">Nenhum aniversariante encontrado</div>
                            <div className="text-sm">
                                {search.trim() ?
                                    "Nenhum membro encontrado com esse nome" :
                                    `Não há membros fazendo aniversário em ${months[monthFilter.month - 1]}`
                                }
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="link"
                                    onClick={handleClearFilters}
                                    className="text-pink-600"
                                >
                                    Limpar busca para ver todos
                                </Button>
                            )}
                        </div>
                    ) : (
                        members.map(member => {
                            const isTodayBirthday = member.dateOfBirth ?
                                isToday(parseISO(member.dateOfBirth)) : false;
                            const currentAge = getCurrentAge(member.dateOfBirth);
                            const nextAge = getNextAge(member.dateOfBirth);

                            return (
                                <div key={member.id} className="relative">
                                    <Card className={`h-full transition-all duration-300 hover:scale-[1.02] ${getBirthdayCardStyle(member)}`}>
                                        <CardContent className="p-6 pt-8">
                                            {/* Nome e função */}
                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg truncate">{member.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {UserRoleLabels[member.role]}
                                                    </Badge>
                                                    {isTodayBirthday && (
                                                        <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-0 animate-pulse">
                                                            <Gift className="w-3 h-3 mr-1" />
                                                            Hoje!
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Data de aniversário */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-pink-600" />
                                                    <div>
                                                        <div className="font-medium text-stone-900">
                                                            {formatBirthday(member.dateOfBirth)}
                                                        </div>
                                                        <div className="text-sm text-stone-600">
                                                            {formatDateSafe(member.dateOfBirth)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Idade */}
                                                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                                    <div className="text-sm text-stone-600 mb-1">Fazendo</div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                            {nextAge}
                                                        </span>
                                                        <span className="text-stone-700">anos</span>
                                                    </div>
                                                    <div className="text-xs text-stone-500 mt-1">
                                                        {currentAge !== nextAge ?
                                                            `(Atualmente com ${currentAge} anos)` :
                                                            `Idade atual`
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botão de detalhes */}
                                            <div className="mt-6 flex justify-between items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpand(member.id)}
                                                    className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                                    disabled={member.detailsLoading}
                                                >
                                                    {member.detailsLoading ? (
                                                        <div className="w-4 h-4 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                                                    ) : expandedIds.has(member.id) ? (
                                                        "Ver menos"
                                                    ) : (
                                                        "Ver detalhes"
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>

                                        {/* Detalhes expandidos */}
                                        {expandedIds.has(member.id) && (
                                            <CardContent className="border-t border-stone-100 p-6 pt-4 bg-stone-50">
                                                {member.detailsLoading ? (
                                                    <div className="space-y-3">
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-4 w-2/3" />
                                                        <Skeleton className="h-4 w-3/4" />
                                                    </div>
                                                ) : member.details ? (
                                                    <div className="space-y-4">
                                                        {/* Contato */}
                                                        {member.details.phone && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="w-4 h-4 text-stone-500 flex-shrink-0" />
                                                                <span className="font-medium">Telefone:</span>
                                                                <span className="text-stone-700">{member.details.phone}</span>
                                                            </div>
                                                        )}

                                                        {/* Profissão */}
                                                        {member.details.professionalWork && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Briefcase className="w-4 h-4 text-stone-500 flex-shrink-0" />
                                                                <span className="font-medium">Profissão:</span>
                                                                <span className="text-stone-700">{member.details.professionalWork}</span>
                                                            </div>
                                                        )}

                                                        {/* Endereço */}
                                                        {(member.details.city || member.details.neighborhood) && (
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <MapPin className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <span className="font-medium">Localização:</span>
                                                                    <div className="text-stone-700">
                                                                        {member.details.neighborhood && `${member.details.neighborhood}, `}
                                                                        {member.details.city}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Informações eclesiásticas */}
                                                        <div className="pt-3 border-t border-stone-200">
                                                            <h4 className="font-medium text-stone-900 mb-2">Informações da Igreja</h4>
                                                            <div className="space-y-2">
                                                                {member.details.entryDate && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Home className="w-4 h-4 text-stone-500" />
                                                                        <span className="font-medium">Membro desde:</span>
                                                                        <span className="text-stone-700">{formatDateSafe(member.details.entryDate)}</span>
                                                                    </div>
                                                                )}

                                                                {member.details.isBaptized !== undefined && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Droplets className="w-4 h-4 text-stone-500" />
                                                                        <span className="font-medium">Batizado:</span>
                                                                        <Badge variant={member.details.isBaptized ? "default" : "secondary"} className="text-xs">
                                                                            {member.details.isBaptized ? "Sim" : "Não"}
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-stone-500 text-sm">
                                                        Erro ao carregar detalhes do membro
                                                    </div>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}