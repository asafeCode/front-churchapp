import * as React from "react";
import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            // Permitir que o valor seja apagado quando for "0" ou vazio
            if (newValue === "0" && newValue.length === 1) {
                // Impedir que "0" permaneça caso o usuário apague
                onChange?.(e);
            } else {
                onChange?.(e);
            }
        };

        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                value={value}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
