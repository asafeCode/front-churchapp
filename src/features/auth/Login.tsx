import {useNavigate} from "react-router-dom";
import {useAuth} from "../../contexts/useAuth.ts";
import React, {useEffect, useState} from "react";
import type {DoLoginRequest} from "../../models/user.model.ts";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import {Label} from "../../components/ui/label.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Button} from "../../components/ui/button.tsx";
import {LogIn, User} from "lucide-react";
import {tenantService} from "../../services/tenant.service.ts";
import type {ResponseTenantJson} from "../../models/tenant.model.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select.tsx";
import {UserRole} from "../../models/enums.ts";


export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<ResponseTenantJson[]>([]);

  const [credentials, setCredentials] = useState<DoLoginRequest>({
    name: '',
    password: '',
    tenantId: '',
  });

  useEffect(() => {
      loadTenants()
      }, []);

  const loadTenants = async () => {
      try {
          setLoading(true);
          const response = await tenantService.getTenants()
          setTenants(response.tenants)
      } finally {
          setLoading(false);
      }
  }
  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(credentials);
      toast.success('Login realizado com sucesso!');

      if ( user.role === UserRole.ADMINISTRADOR )
          navigate("/dashboard");

      else navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Layout esquerdo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1767170476039-e2bc8916684a?...',
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/80" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <User className="w-16 h-16 mb-6" />
          <h1 className="text-5xl font-heading font-semibold mb-4 tracking-tight">
            Sistema de Tesouraria
          </h1>
          <p className="text-xl text-stone-200">
            Gestão financeira segura para sua organização
          </p>
        </div>
      </div>

      {/* Layout direito - formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-semibold text-stone-900 mb-2">
              Bem-vindo
            </h2>
            <p className="text-stone-600">Entre para acessar sua conta</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login de Usuário</CardTitle>
              <CardDescription>Digite suas credenciais para entrar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name" // <- aqui
                    data-testid="user-name-input"
                    type="text"
                    placeholder="Seu nome"
                    value={credentials.name}
                    onChange={handleChange} // <- e aqui
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    data-testid="user-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantId">Congregação</Label>
                    <Select
                        value={credentials.tenantId}
                        onValueChange={(value) =>
                            setCredentials({
                                ...credentials,
                                tenantId: value,
                            })
                        }
                    >
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione uma congregação"/>
                      </SelectTrigger>

                      <SelectContent>
                          {tenants.map((tenant) => (
                              <SelectItem
                                  key={tenant.id}
                                  value={tenant.id}
                              >
                                  {tenant.name}
                              </SelectItem>
                          ))}
                      </SelectContent>

                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="user-login-submit"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-2 text-center">
              <button
                onClick={() => navigate('/owner-login')}
                className="text-emerald-700 hover:underline text-sm"
                data-testid="owner-login-link"
              >
                Entrar como Owner
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
