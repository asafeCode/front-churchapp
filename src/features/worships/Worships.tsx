import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Church } from 'lucide-react';
import { worshipService } from '../../services/worship.service';
import { toast } from 'sonner';
import { DayOfWeek } from '../../models/enums';
import { DayOfWeekLabels } from '../../models/enum-labels';
import type {CreateWorshipRequest, ResponseWorship} from '../../models/worship.model';
import { EnumSelect } from '../../components/ui/enum-select';

export default function Worships() {
  const [worships, setWorships] = useState<ResponseWorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<CreateWorshipRequest>({
    dayOfWeek: DayOfWeek.DOMINGO,
    time: '',
    description: '',
  });

  // Carrega cultos ao montar componente
  useEffect(() => {
    const loadWorships = async () => {
      try {
        setLoading(true);
        const response = await worshipService.getWorships();
        setWorships(response.worships ?? []);
      } catch (error) {
        toast.error('Falha ao carregar cultos');
      } finally {
        setLoading(false);
      }
    };

    loadWorships();
  }, []);

  // Cria novo culto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await worshipService.createWorship(formData);
      toast.success('Culto criado com sucesso');
      setFormData({ dayOfWeek: DayOfWeek.DOMINGO, time: '', description: '' });
      setShowDialog(false);
      // Recarrega lista
      const response = await worshipService.getWorships();
      setWorships(response.worships ?? []);
    } catch (error: any) {
      toast.error(error.response?.data?.errors?.[0] || 'Falha ao criar culto');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-semibold text-stone-900 tracking-tight">
              Cultos
            </h1>
            <p className="text-stone-600 mt-1">Gerencie os horários de cultos</p>
          </div>

          {/* Dialog Criar Culto */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button data-testid="create-worship-button">
                <Plus className="w-4 h-4 mr-2" /> Criar Culto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Culto</DialogTitle>
                <DialogDescription>Adicione um novo horário de culto</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <EnumSelect
                    value={formData.dayOfWeek}
                    onChange={(dayOfWeek) => setFormData({ ...formData, dayOfWeek })}
                    labels={DayOfWeekLabels}
                    testId="worship-day-select"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    data-testid="worship-time-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Culto de Celebração"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="worship-description-input"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="worship-submit">
                  Criar Culto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Cultos */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (worships.length === 0 ? (
              <div className="text-center py-12 text-stone-500" data-testid="empty-worships-state">
                <Church className="w-12 h-12 mx-auto mb-2 text-stone-300" />
                <p>Nenhum culto encontrado</p>
                <p className="text-sm mt-1">Crie seu primeiro culto para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="worships-table">
                  <thead className="bg-stone-100 text-left">
                    <tr>
                      <th className="p-3 text-sm font-semibold">Dia da Semana</th>
                      <th className="p-3 text-sm font-semibold">Horário</th>
                      <th className="p-3 text-sm font-semibold">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {worships.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-50">
                        <td className="p-3 text-sm font-medium">{DayOfWeekLabels[w.dayOfWeek]}</td>
                        <td className="p-3 text-sm font-mono">{w.time}</td>
                        <td className="p-3 text-sm">{w.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
