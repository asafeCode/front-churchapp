import {useState, useEffect} from 'react';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import {Card, CardContent} from '../../components/ui/card';
import {Plus, Church, Loader2, Calendar, Clock, FileText} from 'lucide-react';
import {worshipService} from '../../services/worship.service';
import {toast} from 'sonner';
import {DayOfWeek} from '../../models/enums';
import {DayOfWeekLabels} from '../../models/enum-labels';
import type {CreateWorshipRequest, ResponseWorship} from '../../models/worship.model';
import {EnumSelect} from '../../components/ui/enum-select';

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
            } finally {
                setLoading(false);
            }
        };

        loadWorships();
    }, []);

    // Cria novo culto
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await worshipService.createWorship(formData);
        toast.success('Culto criado com sucesso');
        setFormData({dayOfWeek: DayOfWeek.DOMINGO, time: '', description: ''});
        setShowDialog(false);
        const response = await worshipService.getWorships();
        setWorships(response.worships ?? []);
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

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogTrigger asChild>
                            <Button data-testid="create-worship-button">
                                <Plus className="w-4 h-4 mr-2"/> Criar Culto
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
                                        onChange={(dayOfWeek) => setFormData({...formData, dayOfWeek})}
                                        labels={DayOfWeekLabels}
                                        testId="worship-day-select"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Horário</Label>
                                    <Input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                    <CardContent className="p-4 md:p-6">
                        {loading ? (
                            <div className="flex items-center justify-center min-h-[300px]">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm text-stone-500">Carregando cultos...</p>
                                </div>
                            </div>
                        ) : worships.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6" data-testid="empty-worships-state">
                                <div className="p-4 rounded-full bg-stone-100 mb-4">
                                    <Church className="w-12 h-12 text-stone-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-stone-700 mb-2">Nenhum culto encontrado</h3>
                                <p className="text-stone-500 max-w-md">Crie seu primeiro culto para começar a organizar os horários</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {worships.map((w) => {
                                    const hasDescription = w.description && w.description.trim().length > 0;

                                    return (
                                        <div
                                            key={w.id}
                                            className="group relative bg-white rounded-lg border border-stone-200 p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-200 min-h-[140px] flex flex-col"
                                            data-testid="worship-card"
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-stone-800 truncate">
                                                        {DayOfWeekLabels[w.dayOfWeek]}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                                        <span className="font-medium">{w.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Descrição ou placeholder */}
                                            <div className="mt-auto pt-3">
                                                {hasDescription ? (
                                                    <div className="flex items-start gap-2">
                                                        <FileText className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-stone-600 line-clamp-2 text-left">
                                                            {w.description}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-stone-400">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-sm italic">Sem descrição</span>
                                                    </div>
                                                )}
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
