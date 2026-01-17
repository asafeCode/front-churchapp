import { NumericFormat } from "react-number-format";
import {Input} from "./input.tsx";

type NumberInputProps = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export function NumberInput({
                                value,
                                onChange,
                                placeholder = "0",
                                required = false,
                                disabled = false,
                                className = "",
                            }: NumberInputProps) {
    return (
        <NumericFormat
            customInput={Input}
            value={value}
            allowNegative={false}
            decimalScale={0}
            thousandSeparator={false}
            placeholder={placeholder}
            required={required}
            className={className}
            disabled={disabled}
            onValueChange={(v) => {
                onChange(v.value);
            }}
        />
    );
}