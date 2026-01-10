import {Badge} from "../../components/ui/badge.tsx";


interface ReportHeaderProps {
    title: string;
    description: string;
    month: string;
    date: string;
    icon: React.ReactNode;
}

export function ReportHeader({ title, description, month, date, icon }: ReportHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg">{icon}</div>
                <div>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="text-stone-500">{description}</p>
                    <p className="text-sm text-stone-400 mt-1">Período: {month}</p>
                </div>
            </div>
            <Badge variant="outline" className="text-sm">
                {date}
            </Badge>
        </div>
    );
}