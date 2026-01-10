import { BarChart3, AlertCircle, TrendingUp, Users } from 'lucide-react';
import type {ReportTemplate} from './types';

export const reportTemplates: ReportTemplate[] = [
    {
        key: 'monthly-summary-details',
        title: 'Resumo Mensal com Detalhes',
        description: 'Visão detalhada da saúde financeira da igreja no mês selecionado.',
        icon: BarChart3,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
    },
    {
        key: 'expense-report',
        title: 'Relatório de Despesas',
        description: 'Análise detalhada das despesas e alertas de gastos.',
        icon: AlertCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
    },
    {
        key: 'inflow-report',
        title: 'Relatório de Entradas',
        description: 'Análise das entradas e contribuições recebidas.',
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        key: 'member-participation',
        title: 'Participação dos Membros',
        description: 'Indicador de engajamento sem expor valores individuais.',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
];