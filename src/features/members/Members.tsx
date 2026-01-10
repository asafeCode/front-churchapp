"use client";

import { useEffect, useState } from "react";
import type {
    RegisterUserRequest,
    UserFilters,
    UserProfiles,
    UserProfileResponse
} from "../../models/user.model.ts";
import { UserRole } from "../../models/enums.ts";
import { userService } from "../../services/user.service.ts";
import { toast } from "sonner";
import { UserRoleLabels } from "../../models/enum-labels.ts";
import { DashboardLayout } from "../../components/layout/DashboardLayout.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription
} from "../../components/ui/alert-dialog.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog.tsx";
import { Search, Trash2, UserPlus, Users, ChevronDown, ChevronUp, X, Phone, MapPin, Calendar, Droplets, Home, Briefcase } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { EnumSelect } from "../../components/ui/enum-select.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberWithDetails extends UserProfiles {
    details?: UserProfileResponse;
    detailsLoading?: boolean;
}

export default function Members() {
    const [members, setMembers] = useState<MemberWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<MemberWithDetails | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const [filters, setFilters] = useState<UserFilters>({});
    const [search, setSearch] = useState<string>("");

    const [formData, setFormData] = useState<RegisterUserRequest>({
        name: '',
        role: UserRole.MEMBRO,
        dateOfBirth: '',
        password: '',
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async (customFilters: UserFilters = {}) => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers(customFilters);
            setMembers(response.users.map(user => ({ ...user, details: undefined, detailsLoading: false })));
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (id: string) => {
        const isExpanding = !expandedIds.has(id);

        // Atualiza o estado de expansão
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });

        // Se está expandindo, carrega os detalhes
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await userService.registerUser(formData);
        toast.success('Membro criado com sucesso');
        setOpenCreate(false);
        setFormData({ name: '', role: UserRole.MEMBRO, dateOfBirth: '', password: '' });
        loadMembers();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await userService.deleteUserById(deleteTarget.id);
        toast.success('Membro removido');
        setDeleteTarget(null);
        loadMembers();
    };

    const formatDateSafe = (dateString?: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return '—';

        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return '—';
        }
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearch("");
        loadMembers({});
        toast.info("Filtros limpos");
    };

    const hasActiveFilters = filters.role !== undefined || search.trim() !== "";

    return (
        <DashboardLayout>
            <div className="space-y-6 mt-4">
                {/* Header e botão novo membro */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-4xl font-heading font-semibold">Membros</h1>
                        <Badge variant="outline" className="text-sm">{members.length}</Badge>
                    </div>

                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Novo Membro
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-full max-w-md">
                            <DialogHeader>
                                <DialogTitle>Criar Membro</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Label>Nome</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Função</Label>
                                    <EnumSelect<UserRole>
                                        value={formData.role}
                                        onChange={role => setFormData({ ...formData, role })}
                                        labels={UserRoleLabels}
                                    />
                                </div>

                                <div>
                                    <Label>Data de Nascimento</Label>
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full">Criar</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="mt-6 md:mt-4 flex flex-col gap-4 md:grid md:grid-cols-12 md:items-end">
                        <div className="w-full md:col-span-4">
                            <Label>Buscar</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Buscar por nome"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            </div>
                        </div>

                        <div className="w-full md:col-span-3">
                            <Label>Função</Label>
                            <EnumSelect<UserRole>
                                value={filters.role ?? UserRole.MEMBRO}
                                onChange={(role) => setFilters({ ...filters, role })}
                                labels={UserRoleLabels}
                                placeholder="Todas"
                            />
                        </div>

                        <div className="w-full md:col-span-3">
                            <Button
                                onClick={() => loadMembers({
                                    ...filters,
                                    name: search.trim() || undefined
                                })}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Filtrar
                            </Button>
                        </div>

                        <div className="w-full md:col-span-2">
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2"
                                disabled={!hasActiveFilters}
                            >
                                <X className="w-4 h-4" />
                                Limpar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de membros */}
                <Card>
                    <CardContent className="mt-6 flex flex-col gap-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-md"/>)}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-10 text-stone-500 space-y-4">
                                <Users className="mx-auto mb-2"/>
                                <div>Nenhum membro encontrado</div>
                                {hasActiveFilters && (
                                    <Button
                                        variant="link"
                                        onClick={handleClearFilters}
                                        className="text-blue-600"
                                    >
                                        Limpar filtros para ver todos
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <ul className="space-y-3">
                                    {members.map(member => (
                                        <li key={member.id}>
                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardContent className="flex justify-between items-center gap-4 p-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{member.name}</p>
                                                        <p className="text-sm text-stone-500">{UserRoleLabels[member.role]}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleExpand(member.id)}
                                                            className="p-2"
                                                            disabled={member.detailsLoading}
                                                        >
                                                            {member.detailsLoading ? (
                                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                                            ) : expandedIds.has(member.id) ? (
                                                                <ChevronUp className="w-4 h-4"/>
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4"/>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteTarget(member)}
                                                            className="text-red-600 p-2"
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                </CardContent>

                                                {expandedIds.has(member.id) && (
                                                    <CardContent className="border-t border-stone-100 p-4">
                                                        {member.detailsLoading ? (
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-3/4" />
                                                                <Skeleton className="h-4 w-1/2" />
                                                                <Skeleton className="h-4 w-2/3" />
                                                            </div>
                                                        ) : member.details ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {/* Informações básicas */}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Calendar className="w-4 h-4 text-stone-500" />
                                                                        <span className="font-medium">Nascimento:</span>
                                                                        <span>{formatDateSafe(member.details.dateOfBirth)} ({member.details.age} anos)</span>
                                                                    </div>

                                                                    {member.details.gender && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="font-medium">Gênero:</span>
                                                                            <span>{member.details.gender}</span>
                                                                        </div>
                                                                    )}

                                                                    {member.details.fullName && (
                                                                        <div className="text-sm">
                                                                            <span className="font-medium">Nome completo:</span>
                                                                            <p className="text-stone-700">{member.details.fullName}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Contato */}
                                                                <div className="space-y-2">
                                                                    {member.details.phone && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <Phone className="w-4 h-4 text-stone-500" />
                                                                            <span className="font-medium">Telefone:</span>
                                                                            <span>{member.details.phone}</span>
                                                                        </div>
                                                                    )}

                                                                    {member.details.professionalWork && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <Briefcase className="w-4 h-4 text-stone-500" />
                                                                            <span className="font-medium">Profissão:</span>
                                                                            <span>{member.details.professionalWork}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Endereço */}
                                                                {(member.details.city || member.details.neighborhood) && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <MapPin className="w-4 h-4 text-stone-500" />
                                                                            <span className="font-medium">Endereço:</span>
                                                                        </div>
                                                                        {member.details.city && (
                                                                            <div className="text-sm pl-6">
                                                                                <span className="font-medium">Cidade:</span>
                                                                                <span className="ml-2">{member.details.city}</span>
                                                                            </div>
                                                                        )}
                                                                        {member.details.neighborhood && (
                                                                            <div className="text-sm pl-6">
                                                                                <span className="font-medium">Bairro:</span>
                                                                                <span className="ml-2">{member.details.neighborhood}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Informações eclesiásticas */}
                                                                {(member.details.entryDate || member.details.conversionDate || member.details.isBaptized !== undefined) && (
                                                                    <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
                                                                        <h4 className="font-medium text-stone-900">Informações Eclesiásticas</h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            {member.details.entryDate && (
                                                                                <div className="flex items-center gap-2 text-sm">
                                                                                    <Home className="w-4 h-4 text-stone-500" />
                                                                                    <span className="font-medium">Entrada:</span>
                                                                                    <span>{formatDateSafe(member.details.entryDate)}</span>
                                                                                </div>
                                                                            )}

                                                                            {member.details.conversionDate && (
                                                                                <div className="flex items-center gap-2 text-sm">
                                                                                    <span className="font-medium">Conversão:</span>
                                                                                    <span>{formatDateSafe(member.details.conversionDate)}</span>
                                                                                </div>
                                                                            )}

                                                                            {member.details.isBaptized !== undefined && (
                                                                                <div className="flex items-center gap-2 text-sm">
                                                                                    <Droplets className="w-4 h-4 text-stone-500" />
                                                                                    <span className="font-medium">Batizado:</span>
                                                                                    <Badge variant={member.details.isBaptized ? "default" : "secondary"}>
                                                                                        {member.details.isBaptized ? "Sim" : "Não"}
                                                                                    </Badge>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4 text-stone-500">
                                                                Erro ao carregar detalhes do membro
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                )}
                                            </Card>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de exclusão */}
                <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir membro</AlertDialogTitle>
                            <AlertDialogDescription>Deseja excluir {deleteTarget?.name}?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}