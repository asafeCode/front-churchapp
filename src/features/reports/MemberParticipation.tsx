import { Users, TrendingUp } from 'lucide-react';
import type { ReportData, FinancialSummary } from './types';
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card.tsx";
import {Progress} from "../../components/ui/progress.tsx";

interface MemberParticipationProps {
    reportData: ReportData;
    financialSummary: FinancialSummary;
}

export function MemberParticipation({ reportData, financialSummary }: MemberParticipationProps) {
    const activeUsers = reportData.users;
    const uniqueContributors = [...new Set(reportData.inflows.map((i) => i.memberId))];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-stone-500">Membros Ativos</p>
                                <h3 className="text-2xl font-bold text-purple-600">{activeUsers.length}</h3>
                            </div>
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-stone-500">Contribuintes Únicos</p>
                                <h3 className="text-2xl font-bold text-emerald-600">
                                    {uniqueContributors.length}
                                </h3>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-stone-500">Taxa de Participação</p>
                                <h3 className="text-2xl font-bold text-blue-600">
                                    {financialSummary.participationRate.toFixed(1)}%
                                </h3>
                            </div>
                            <div className="relative">
                                <div className="w-16 h-16">
                                    <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {financialSummary.participationRate.toFixed(0)}%
                    </span>
                                    </div>
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="3"
                                            strokeDasharray={`${financialSummary.participationRate}, 100`}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Engajamento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Meta de participação (70%)</span>
                                <span>{financialSummary.participationRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={financialSummary.participationRate} max={70} className="h-3" />
                            <p className="text-xs text-stone-500">
                                {financialSummary.participationRate >= 70
                                    ? '✅ Meta atingida'
                                    : `Faltam ${(70 - financialSummary.participationRate).toFixed(1)}% para atingir a meta`}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-emerald-600">
                                    {reportData.inflows.length}
                                </p>
                                <p className="text-sm text-stone-500">Contribuições totais</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">
                                    {Math.round(reportData.inflows.length / 4)}
                                </p>
                                <p className="text-sm text-stone-500">Média semanal</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}