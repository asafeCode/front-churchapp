import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

interface EnumSelectProps<T extends number> {
    value?: T;
    onChange: (value: T | undefined) => void;
    labels: Record<T, string>;
    placeholder?: string;
    testId?: string;
    allowEmpty?: boolean;
    emptyLabel?: string;
}

export function EnumSelect<T extends number>({
    value,
    onChange,
    labels,
    placeholder = 'Selecione',
    testId,
    allowEmpty = false,
    emptyLabel = 'Todos',
}: EnumSelectProps<T>) {
    const entries = Object.entries(labels) as Array<[string, string]>;

    return (
        <Select
            value={value !== undefined ? String(value) : '__empty__'}
            onValueChange={(val) =>
                onChange(val === '__empty__' ? undefined : (Number(val) as T))
            }
        >
            <SelectTrigger data-testid={testId}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                {allowEmpty && (
                    <SelectItem value="__empty__">
                        {emptyLabel}
                    </SelectItem>
                )}

                {entries.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}