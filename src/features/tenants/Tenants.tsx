import React, {useEffect, useState} from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog'

import { tenantService } from '../../services/tenant.service'
import type {CreateTenantRequest, ResponseTenantJson} from '../../models/tenant.model'
import {Card, CardContent} from "../../components/ui/card.tsx";


export default function Tenants() {
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState<CreateTenantRequest>({
        name: '',
        domainName: '',
    })
    const [tenants, setTenants] = useState<ResponseTenantJson[]>([]);

    useEffect(() => {
        loadTenants()
    }, []);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const { tenants } = await tenantService.getTenants()
            setTenants(tenants)
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateTenant(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault()

        setIsSubmitting(true)

        await tenantService.createTenant({
            name: formData.name,
            domainName: formData.domainName || null,
        })

        toast.success('Tenant criado com sucesso')

        setShowCreateDialog(false)
        setFormData({ name: '', domainName: '' })
        setIsSubmitting(false)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-heading font-semibold tracking-tight">
                            Tenants
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie os tenants da plataforma
                        </p>
                    </div>

                    <Dialog
                        open={showCreateDialog}
                        onOpenChange={setShowCreateDialog}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Tenant
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Novo Tenant</DialogTitle>
                                <DialogDescription>
                                    Crie uma nova organização
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                onSubmit={handleCreateTenant}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-name">Nome</Label>
                                    <Input
                                        id="tenant-name"
                                        placeholder="Ex: Igreja Central"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tenant-domain">
                                        Domínio (opcional)
                                    </Label>
                                    <Input
                                        id="tenant-domain"
                                        placeholder="igreja-central"
                                        value={formData.domainName ?? ''}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                domainName: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Criando...' : 'Criar Tenant'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="text-center py-10">Carregando...</div>
                        ) : tenants.length === 0 ? (
                            <div className="rounded-md border bg-background p-8">
                                <p className="text-center text-muted-foreground">
                                    Apenas owners podem criar tenants.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-stone-100 text-left">
                                <tr>
                                    <th className="p-3">Nome</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tenants.map((i) => (
                                    <tr key={i.id} className="border-b">
                                        <td className="p-3">
                                            {i.name}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>


            </div>
        </DashboardLayout>
    )
}
