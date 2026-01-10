import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/useAuth';

import type { OwnerLoginRequest } from '../../models/user.model';
import { toast } from '../../components/ui/sonner';


export default function OwnerLogin() {
  const navigate = useNavigate();
  const { ownerLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const [credentials, setCredentials] = useState<OwnerLoginRequest>({
    email: '',
    password: '',
  });

  const handleOwnerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ownerLogin(credentials);
      toast.success('Login de Owner realizado com sucesso!');
      navigate('/tenants');

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
      {/* Painel esquerdo com imagem e descrição */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1573164574233-3f11b69b1b03?auto=format&fit=crop&w=1400&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/80" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Building2 className="w-16 h-16 mb-6" />
          <h1 className="text-5xl font-heading font-semibold mb-4 tracking-tight">
            Área do Owner
          </h1>
          <p className="text-xl text-stone-200">
            Gerencie sua organização de forma segura e eficiente
          </p>
        </div>
      </div>

      {/* Painel direito - formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-semibold text-stone-900 mb-2">
              Bem-vindo, Owner
            </h2>
            <p className="text-stone-600">Entre para acessar sua conta</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login de Owner</CardTitle>
              <CardDescription>Digite suas credenciais para entrar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-email">E-mail</Label>
                  <Input
                    id="owner-email"
                    name="email"
                    type="email"
                    placeholder="owner@example.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-password">Senha</Label>
                  <Input
                    id="owner-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="w-4 h-4 mr-2" />
                  {loading ? 'Entrando...' : 'Entrar como Owner'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600">
              Não é Owner?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-emerald-700 hover:underline font-medium"
              >
                Entrar como Usuário
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
