// src/features/auth/MemberRegister.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { toast } from "sonner";
import type { MemberRegisterRequest } from "../../models/user.model.ts";
import { UserPlus, ArrowLeft, Church } from "lucide-react";
import {useAuth} from "../../contexts/useAuth.ts";

export function MemberRegister() {
    const navigate = useNavigate();
    const location = useLocation();
    const { memberRegister } = useAuth()

    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState<{
        tenantName?: string;
        code?: string;
    } | null>(null);

    const [formData, setFormData] = useState<MemberRegisterRequest>({
        name: "",
        password: "",
        inviteCode: "",
    });

    useEffect(() => {
        // Pega os dados do convite passados pelo InviteEntry
        if (location.state) {
            const state = location.state as { inviteCode?: string; tenantName?: string };

            if (!state.inviteCode) {
                navigate("/login");
                return;
            }

            setInviteData({
                tenantName: state.tenantName,
                code: state.inviteCode,
            });

            setFormData(prev => ({
                ...prev,
                inviteCode: state.inviteCode || "",
            }));
        } else {
            // Se não há estado, redireciona para login
            navigate("/login");
        }
    }, [location.state, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name || !formData.password) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }
        setLoading(true);
        try {
            await memberRegister(formData);
            toast.success("Cadastro realizado com sucesso!");
            navigate("/profile")

        } finally {
            setLoading(false);
        }

    };

    if (!inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-stone-600">Carregando informações do convite...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Layout esquerdo - mesma imagem do Login */}
            <div
                className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1767170476039-e2bc8916684a?...',
                }}
            >
                <div className="absolute inset-0 bg-emerald-950/80" />
                <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                    <UserPlus className="w-16 h-16 mb-6" />
                    <h1 className="text-5xl font-heading font-semibold mb-4 tracking-tight">
                        Cadastro de Membro
                    </h1>
                    <p className="text-xl text-stone-200">
                        Complete seu cadastro para começar a usar o sistema
                    </p>
                </div>
            </div>

            {/* Layout direito - formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-heading font-semibold text-stone-900 mb-2">
                            Complete seu Cadastro
                        </h2>
                        <p className="text-stone-600">Preencha os dados abaixo para criar sua conta</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Membro</CardTitle>
                            <CardDescription>
                                Você foi convidado para se juntar à congregação
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Informações do convite (readonly) */}
                                <div className="space-y-2 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center gap-2">
                                        <Church className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700">
                                            Informações do Convite
                                        </span>
                                    </div>
                                    <div>
                                        <Label htmlFor="tenantName" className="text-xs">Nome da Igreja</Label>
                                        <Input
                                            id="tenantName"
                                            value={inviteData.tenantName || ""}
                                            disabled
                                            className="bg-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="inviteCode" className="text-xs">Código do Convite</Label>
                                        <Input
                                            id="inviteCode"
                                            value={inviteData.code || ""}
                                            disabled
                                            className="bg-white font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Campos do formulário */}
                                <div className="space-y-2">
                                    <Label htmlFor="name"> Seu Nome </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Digite seu nome"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Crie uma senha segura"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-stone-500">
                                        A senha deve ter pelo menos 6 caracteres
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {loading ? 'Criando conta...' : 'Criar Conta'}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-stone-200">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate("/login")}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar para o Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-4 text-center text-sm text-stone-500">
                        <p>
                            Ao criar sua conta, você concorda com nossos{" "}
                            <a href="#" className="text-emerald-700 hover:underline">
                                Termos de Serviço
                            </a>{" "}
                            e{" "}
                            <a href="#" className="text-emerald-700 hover:underline">
                                Política de Privacidade
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}