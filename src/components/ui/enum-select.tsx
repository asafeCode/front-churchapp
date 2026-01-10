import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from './select';

interface EnumSelectProps<T extends number> {
    value: T;
    onChange: (value: T) => void;
    labels: Record<T, string>;
    placeholder?: string;
    testId?: string;
}

export function EnumSelect<T extends number>({
                                                 value,
                                                 onChange,
                                                 labels,
                                                 placeholder = 'Selecione',
                                                 testId,
                                             }: EnumSelectProps<T>) {

    const entries = Object.entries(labels) as Array<[string, string]>;
    return (
        <Select value={String(value)}
                onValueChange={(val) =>
                    onChange(Number(val) as T)}>
            <SelectTrigger data-testid={testId}>
                <SelectValue placeholder={placeholder}/>
            </SelectTrigger>
        <SelectContent> {entries.map(([key, label]) => (
            <SelectItem key={key} value={key}>
                {label}
            </SelectItem>))}
        </SelectContent>
        </Select>);
}