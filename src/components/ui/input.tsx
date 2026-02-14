import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-10 px-3.5 bg-surface border border-border rounded-xl text-sm transition-all duration-200 outline-none",
                        "hover:border-border-strong",
                        "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
                        "placeholder:text-muted-foreground/50 text-foreground",
                        error && "border-rose-500! bg-rose-50/50! dark:bg-rose-500/5! focus:ring-rose-500/15!",
                        className
                    )}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
                {error && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export { Input };
