import { NumericFormat } from "react-number-format"
import { Input } from "./input"

type MoneyInputProps = {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    required?: boolean
}

export function MoneyInput({
                               value,
                               onChange,
                               placeholder,
                               className,
                                disabled,
                                required,
                           }: MoneyInputProps) {
    return (
        <NumericFormat
            customInput={Input}
            value={value}
            allowLeadingZeros
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator="."
            inputMode="decimal"
            prefix="R$ "
            placeholder={placeholder ?? "R$ 0,00"}
            disabled={disabled}
            required={required}
            className={className}
            onValueChange={(v) => {
                // v.value -> "1198.78" (pra API)
                onChange(v.value)
            }}
        />
    )
}
