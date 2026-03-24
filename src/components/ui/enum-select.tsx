import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

type EnumSelectOptionalProps<T extends number> = {
    value?: T;
    onChange: (value: T | undefined) => void;
    labels: Record<T, string>;
    placeholder?: string;
    testId?: string;
    allowEmpty: true;
    emptyLabel?: string;
};

type EnumSelectRequiredProps<T extends number> = {
    value: T;
    onChange: (value: T) => void;
    labels: Record<T, string>;
    placeholder?: string;
    testId?: string;
    allowEmpty?: false;
    emptyLabel?: string;
};

type EnumSelectProps<T extends number> =
    | EnumSelectOptionalProps<T>
    | EnumSelectRequiredProps<T>;

export function EnumSelect<T extends number>(props: EnumSelectProps<T>) {
    const {
        value,
        onChange,
        labels,
        placeholder = 'Selecione',
        testId,
    } = props;

    const allowEmpty = props.allowEmpty ?? false;
    const emptyLabel = props.emptyLabel ?? 'Todos';
    const entries = Object.entries(labels) as Array<[string, string]>;

    return (
        <Select
            value={value !== undefined ? String(value) : '__empty__'}
            onValueChange={(val) => {
                if (val === '__empty__') {
                    if (allowEmpty) {
                        (onChange as (value: T | undefined) => void)(undefined);
                    }
                    return;
                }

                (onChange as (value: T) => void)(Number(val) as T);
            }}
        >
            <SelectTrigger data-testid={testId}>
                <SelectValue placeholder={placeholder}>
                    {value === undefined
                        ? (allowEmpty ? emptyLabel : undefined)
                        : labels[value]}
                </SelectValue>
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