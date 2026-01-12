import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  Plus,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import type {ResponseInflowJson} from "../../models/inflow.model.ts";
import type {ResponseShortOutflow} from "../../models/outflow.model.ts";
import {inflowService} from "../../services/inflow.service.ts";
import {outflowService} from "../../services/outflow.service.ts";
import {DashboardLayout} from "../../components/layout/DashboardLayout.tsx";
import {Button} from "../../components/ui/button.tsx";
import {KPICard} from "../../components/dashboard/KPICard.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import {getPaymentMethodLabel} from "../../models/enum-labels.ts";




interface DashboardStats {
  totalInflows: number;
  totalOutflows: number;
  balance: number;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inflows, setInflows] = useState<ResponseInflowJson[]>([]);
  const [outflows, setOutflows] = useState<ResponseShortOutflow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInflows: 0,
    totalOutflows: 0,
    balance: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [inflowsRes, outflowsRes] = await Promise.all([
        inflowService.getInflows(),
        outflowService.getOutflows(),
      ]);

      const inflowsData = inflowsRes.inflows ;
      const outflowsData = outflowsRes.outflows;

      setInflows(inflowsData);
      setOutflows(outflowsData);


      setStats({
          totalInflows: inflowsRes.totalAmount,
          totalOutflows: outflowsRes.totalAmount,
          balance: inflowsRes.totalAmount - outflowsRes.totalAmount,
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    {
      name: 'Mês Atual',
      Entradas: stats.totalInflows,
      Saidas: stats.totalOutflows,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-heading font-semibold text-stone-900">
              Painel
            </h1>
            <p className="text-stone-600 mt-1">
              Visão geral das finanças da tesouraria
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/inflows')}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Entrada
            </Button>

            <Button
              onClick={() => navigate('/outflows')}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Saída
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Total de Entradas"
            value={`R$ ${stats.totalInflows.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`}
            icon={ArrowDownCircle}
          />

          <KPICard
            title="Total de Saídas"
            value={`R$ ${stats.totalOutflows.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`}
            icon={ArrowUpCircle}
          />

          <KPICard
            title="Saldo Atual"
            value={`R$ ${stats.balance.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`}
            icon={DollarSign}
            className="border-l-amber-600"
          />
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Visão Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entradas" fill="#10b981" />
                <Bar dataKey="Saídas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inflows */}
          <Card>
            <CardHeader>
              <CardTitle>Entradas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {inflows.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  Nenhuma entrada ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {inflows.slice(0, 5).map((inflow) => (
                    <div
                      key={inflow.id}
                      className="flex justify-between p-3 bg-stone-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {inflow.memberName ?? 'N/A'}
                        </p>
                        <p className="text-xs text-stone-500">
                          {format(new Date(inflow.date), 'dd/MM/yyyy')} •{' '}
                          {getPaymentMethodLabel(inflow.paymentMethod)}
                        </p>
                      </div>
                      <p className="font-mono font-semibold text-green-600">
                        +R$ {inflow.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outflows */}
          <Card>
            <CardHeader>
              <CardTitle>Saídas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {outflows.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  Nenhuma saída ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {outflows.slice(0, 5).map((outflow) => (
                    <div
                      key={outflow.id}
                      className="flex justify-between p-3 bg-stone-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {outflow.expenseName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {format(new Date(outflow.date), 'dd/MM/yyyy')} •{' '}
                          {outflow.currentInstallment}/{outflow.totalInstallments}
                        </p>
                      </div>
                      <p className="font-mono font-semibold text-red-600">
                        -R$ {outflow.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
