import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-bold text-foreground">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-2.5 bg-surface-hover border-transparent rounded-xl text-sm transition-all outline-none",
                        "focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
                        "placeholder:text-muted text-foreground",
                        error ? "border-danger-500 bg-danger-50/50 dark:bg-danger-500/10 focus:ring-danger-500/10" : "border-transparent",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm font-medium text-danger-600 dark:text-danger-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export { Input };
