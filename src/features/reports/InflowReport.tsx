import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DayOfWeekLabels } from '../../models/enum-labels';
import type { ReportData, FinancialSummary } from './types';

interface InflowReportProps {
    reportData: ReportData;
    financialSummary: FinancialSummary;
}

export function InflowReport({ reportData, financialSummary }: InflowReportProps) {
    const mostProfitableWorshipData = reportData.worships.find(
        (w) => w.description === financialSummary.mostProfitableWorship.name,
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Culto Mais Produtivo</h3>
                            <p className="text-sm text-stone-500">Maior média de contribuições</p>
                        </div>
                        <Badge variant="default" className="text-lg">
                            🏆
                        </Badge>
                    </div>
                    <div className="text-center py-4">
                        <p className="text-3xl font-bold text-emerald-600">
                            {financialSummary.mostProfitableWorship.name}
                        </p>
                        <p className="text-stone-500 mt-2">
                            Total: R$ {financialSummary.mostProfitableWorship.total.toFixed(2)}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-stone-500">Contribuições</p>
                                <p className="text-xl font-bold">
                                    {mostProfitableWorshipData
                                        ? reportData.inflows.filter((i) => i.worshipId === mostProfitableWorshipData.id).length
                                        : 0}
                                </p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-stone-500">Média por contribuição</p>
                                <p className="text-xl font-bold">
                                    R${' '}
                                    {mostProfitableWorshipData && financialSummary.mostProfitableWorship.total > 0
                                        ? (
                                            financialSummary.mostProfitableWorship.total /
                                            reportData.inflows.filter((i) => i.worshipId === mostProfitableWorshipData.id).length
                                        ).toFixed(2)
                                        : '0.00'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comparativo por Culto</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reportData.worships.map((worship) => {
                            const worshipTotal = reportData.inflows
                                .filter((inflow) => inflow.worshipId === worship.id)
                                .reduce((sum, inflow) => sum + (inflow.amount || 0), 0);

                            const isMostProfitable =
                                worship.description === financialSummary.mostProfitableWorship.name;

                            return (
                                <div
                                    key={worship.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg ${
                                        isMostProfitable ? 'bg-emerald-50 border-emerald-200' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                isMostProfitable ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        />
                                        <div>
                      <span className="font-medium">
                        {DayOfWeekLabels[worship.dayOfWeek]} | {worship.time}
                      </span>
                                            <p className="text-sm text-stone-500">{worship.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">R$ {worshipTotal.toFixed(2)}</p>
                                        <p className="text-sm text-stone-500">
                                            {reportData.inflows.filter((i) => i.worshipId === worship.id).length}{' '}
                                            contribuições
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}