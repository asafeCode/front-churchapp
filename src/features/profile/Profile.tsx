import {type FormEvent, useEffect, useState} from 'react'
import {DashboardLayout} from '../../components/layout/DashboardLayout'
import {Button} from '../../components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../../components/ui/card'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../../components/ui/tabs'
import {
    Briefcase,
    Building,
    Cake,
    Church,
    Droplets,
    Home,
    Lock,
    Mail,
    MapPin,
    Navigation,
    Phone,
    Save,
    Shield,
    User,
    UserCircle
} from 'lucide-react'
import {userService} from '../../services/user.service'
import {toast} from 'sonner'
import {Gender, UserRole} from '../../models/enums'
import type {ChangePasswordRequest, UpdateUserRequest, UserProfileResponse} from '../../models/user.model'
import {Input} from '../../components/ui/input'
import {Label} from '../../components/ui/label'
import {Checkbox} from '../../components/ui/checkbox'
import {Separator} from '../../components/ui/separator'
import {Badge} from '../../components/ui/badge'
import {Progress} from '../../components/ui/progress'
import {GenderLabels} from "../../models/enum-labels.ts";
import {EnumSelect} from "../../components/ui/enum-select.tsx";

interface ProfileState extends UpdateUserRequest {
    username: string
    role: UserRole
    dateOfBirth: string
}

interface PasswordState extends ChangePasswordRequest {
    confirmPassword: string
}

export default function Profile() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [profileData, setProfileData] = useState<ProfileState>({
        username: '',
        role: UserRole.MEMBRO,
        dateOfBirth: '',
        fullName: '',
        gender: Gender.MASCULINO,
        phone: '',
        professionalWork: '',
        entryDate: '',
        conversionDate: '',
        isBaptized: false,
        city: '',
        neighborhood: '',
    })

    const [passwordData, setPasswordData] = useState<PasswordState>({
        password: '',
        newPassword: '',
        confirmPassword: '',
    })

    // Calcular progresso de preenchimento do perfil
    const calculateProfileCompletion = () => {
        const fields = [
            profileData.fullName,
            profileData.dateOfBirth,
            profileData.phone,
            profileData.professionalWork,
            profileData.city,
            profileData.neighborhood,
            profileData.entryDate,
            profileData.conversionDate,
        ]

        const filledFields = fields.filter(field => field && field.trim() !== '').length
        const totalFields = fields.length
        return Math.round((filledFields / totalFields) * 100)
    }

    const profileCompletion = calculateProfileCompletion()

    /* ===================== LOAD ===================== */

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)

            const response: UserProfileResponse =
                await userService.getCurrentUser()

            setProfileData({
                username: response.username,
                role: response.role,
                dateOfBirth: response.dateOfBirth.split('T')[0] || '',
                fullName: response.fullName || '',
                gender: response.gender ?? Gender.MASCULINO,
                phone: response.phone || '',
                professionalWork: response.professionalWork || '',
                entryDate: response.entryDate
                    ? response.entryDate.split('T')[0]
                    : '',
                conversionDate: response.conversionDate
                    ? response.conversionDate.split('T')[0]
                    : '',
                isBaptized: response.isBaptized ?? false,
                city: response.city || '',
                neighborhood: response.neighborhood || '',
            })
        } finally {
            setLoading(false)
        }
    }

    /* ===================== PROFILE ===================== */

    const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        try {
            await userService.updateUser(profileData)
            toast.success('Perfil atualizado com sucesso')
        } finally {
            setSaving(false)
        }
    }

    /* ===================== PASSWORD ===================== */

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('As novas senhas não coincidem')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres')
            return
        }

        await userService.changePassword({
            password: passwordData.password,
            newPassword: passwordData.newPassword,
        })

        toast.success('Senha alterada com sucesso')
        setPasswordData({password: '', newPassword: '', confirmPassword: ''})

    }

    /* ===================== LOADING ===================== */

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"/>
                    <p className="text-stone-600">Carregando suas informações...</p>
                </div>
            </DashboardLayout>
        )
    }

    /* ===================== RENDER ===================== */

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* HEADER COM PROGRESSO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-semibold text-stone-900 tracking-tight">
                            Meu Perfil
                        </h1>
                        <p className="text-stone-600 mt-1">
                            Complete seu perfil para uma melhor experiência
                        </p>
                    </div>

                    <div className="w-full md:w-auto">
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-900">Perfil completo</span>
                                    <span className="text-sm font-bold text-blue-700">{profileCompletion}%</span>
                                </div>
                                <Progress value={profileCompletion} className="h-2"/>
                                <p className="text-xs text-blue-700 mt-2">
                                    {profileCompletion < 100
                                        ? `Complete mais ${100 - profileCompletion}% para finalizar`
                                        : 'Seu perfil está completo!'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full md:w-auto md:inline-flex">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4"/>
                            <span>Informações Pessoais</span>
                        </TabsTrigger>
                        <TabsTrigger value="password" className="flex items-center gap-2">
                            <Shield className="w-4 h-4"/>
                            <span>Segurança</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* COLUNA 1: DADOS BÁSICOS */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* CARD DADOS PESSOAIS */}
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-100">
                                                    <User className="w-5 h-5 text-blue-600"/>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Dados Pessoais</CardTitle>
                                                    <CardDescription>
                                                        Informações básicas sobre você
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <User className="w-4 h-4 text-stone-500"/>
                                                        Nome completo
                                                    </Label>
                                                    <Input
                                                        placeholder="Digite seu nome completo"
                                                        value={profileData.fullName}
                                                        onChange={(e) =>
                                                            setProfileData({...profileData, fullName: e.target.value})
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <Cake className="w-4 h-4 text-stone-500"/>
                                                        Data de nascimento
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={profileData.dateOfBirth}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                dateOfBirth: e.target.value
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <span>👤</span>
                                                        Gênero
                                                    </Label>
                                                    <EnumSelect
                                                        placeholder={"Selecione seu gênero"}
                                                        value={profileData.gender ?? Gender.FEMININO}
                                                        onChange={(value) =>
                                                            setProfileData({...profileData, gender: value})
                                                        }
                                                        labels={GenderLabels}>
                                                    </EnumSelect>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <Phone className="w-4 h-4 text-stone-500"/>
                                                        Telefone
                                                    </Label>
                                                    <Input
                                                        placeholder="(11) 99999-9999"
                                                        value={profileData.phone}
                                                        onChange={(e) =>
                                                            setProfileData({...profileData, phone: e.target.value})
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* CARD INFORMAÇÕES PROFISSIONAIS */}
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-100">
                                                    <Briefcase className="w-5 h-5 text-green-600"/>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Informações Profissionais</CardTitle>
                                                    <CardDescription>
                                                        O que você faz profissionalmente
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm">
                                                    <Briefcase className="w-4 h-4 text-stone-500"/>
                                                    Profissão/Atuação
                                                </Label>
                                                <Input
                                                    placeholder="Ex: Engenheiro, Professor, Estudante..."
                                                    value={profileData.professionalWork}
                                                    onChange={(e) =>
                                                        setProfileData({
                                                            ...profileData,
                                                            professionalWork: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* CARD INFORMAÇÕES ECLESIÁSTICAS */}
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-100">
                                                    <Church className="w-5 h-5 text-purple-600"/>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Informações Eclesiásticas</CardTitle>
                                                    <CardDescription>
                                                        Sua jornada na igreja
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <Home className="w-4 h-4 text-stone-500"/>
                                                        Data de entrada na igreja
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={profileData.entryDate}
                                                        onChange={(e) =>
                                                            setProfileData({...profileData, entryDate: e.target.value})
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <span>✝️</span>
                                                        Data de conversão
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={profileData.conversionDate}
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                conversionDate: e.target.value
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <div className="flex items-center gap-3 p-3 border rounded-md">
                                                        <Droplets className="w-5 h-5 text-blue-500"/>
                                                        <div className="flex-1">
                                                            <Label className="font-medium">Já foi batizado?</Label>
                                                            <p className="text-sm text-stone-500">Marque se você já
                                                                recebeu o batismo nas águas</p>
                                                        </div>
                                                        <Checkbox
                                                            checked={profileData.isBaptized}
                                                            onCheckedChange={(checked) =>
                                                                setProfileData({
                                                                    ...profileData,
                                                                    isBaptized: checked === true
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* COLUNA 2: DADOS DE CONTATO E SALVAR */}
                                <div className="space-y-6">
                                    {/* CARD LOCALIZAÇÃO */}
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-orange-100">
                                                    <MapPin className="w-5 h-5 text-orange-600"/>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Localização</CardTitle>
                                                    <CardDescription>
                                                        Onde você mora
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm">
                                                    <Building className="w-4 h-4 text-stone-500"/>
                                                    Cidade
                                                </Label>
                                                <Input
                                                    placeholder="Sua cidade"
                                                    value={profileData.city}
                                                    onChange={(e) =>
                                                        setProfileData({...profileData, city: e.target.value})
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm">
                                                    <Navigation className="w-4 h-4 text-stone-500"/>
                                                    Bairro
                                                </Label>
                                                <Input
                                                    placeholder="Seu bairro"
                                                    value={profileData.neighborhood}
                                                    onChange={(e) =>
                                                        setProfileData({...profileData, neighborhood: e.target.value})
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* CARD DADOS DA CONTA */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Dados da Conta</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm text-stone-500">Nome de usuário</Label>
                                                <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-md">
                                                    <Mail className="w-4 h-4 text-stone-400"/>
                                                    <Input
                                                        placeholder="Seu nome de Usuário"
                                                        value={profileData.username}
                                                        onChange={(e) =>
                                                            setProfileData({...profileData, username: e.target.value})
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm text-stone-500">Função na igreja</Label>
                                                <Badge variant="outline" className="text-sm">
                                                    {profileData.role === UserRole.MEMBRO ? 'Membro' : profileData.role === UserRole.ADMINISTRADOR ? 'Administrador' : 'Visitante'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* CARD SALVAR ALTERAÇÕES */}
                                    <Card className="sticky top-6">
                                        <CardContent className="p-6">
                                            <div className="text-center space-y-4">
                                                <div className="p-3 rounded-full bg-blue-100 inline-flex">
                                                    <Save className="w-6 h-6 text-blue-600"/>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">Salvar Alterações</h3>
                                                    <p className="text-sm text-stone-500 mt-1">
                                                        Clique no botão abaixo para salvar todas as informações
                                                    </p>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                    size="lg"
                                                >
                                                    {saving ? (
                                                        <>
                                                            <div
                                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>
                                                            Salvando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2"/>
                                                            Salvar Alterações
                                                        </>
                                                    )}
                                                </Button>
                                                <p className="text-xs text-stone-400">
                                                    Suas informações serão salvas de forma segura
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    </TabsContent>

                    {/* PASSWORD TAB */}
                    <TabsContent value="password">
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-100">
                                        <Shield className="w-5 h-5 text-red-600"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Segurança da Conta</CardTitle>
                                        <CardDescription>
                                            Altere sua senha para manter sua conta segura
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="w-4 h-4"/>
                                                Senha atual
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Digite sua senha atual"
                                                value={passwordData.password}
                                                onChange={(e) =>
                                                    setPasswordData({...passwordData, password: e.target.value})
                                                }
                                                required
                                            />
                                        </div>

                                        <Separator/>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="w-4 h-4"/>
                                                Nova senha
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Digite a nova senha"
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    setPasswordData({...passwordData, newPassword: e.target.value})
                                                }
                                                required
                                            />
                                            <p className="text-xs text-stone-500">
                                                A senha deve ter pelo menos 6 caracteres
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="w-4 h-4"/>
                                                Confirmar nova senha
                                            </Label>
                                            <Input
                                                type="password"
                                                placeholder="Digite novamente a nova senha"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordData({...passwordData, confirmPassword: e.target.value})
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-amber-600 mt-0.5"/>
                                            <div>
                                                <h4 className="font-medium text-amber-900">Dicas de segurança</h4>
                                                <ul className="text-sm text-amber-800 mt-1 space-y-1">
                                                    <li>• Use pelo menos 6 caracteres</li>
                                                    <li>• Combine letras, números e símbolos</li>
                                                    <li>• Não use senhas óbvias como "123456"</li>
                                                    <li>• Nunca compartilhe sua senha</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                    >
                                        <Lock className="w-4 h-4 mr-2"/>
                                        Alterar Senha
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}