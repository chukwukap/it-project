import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, options, id, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-semibold text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            "w-full h-10 px-3.5 pr-9 bg-surface border border-border rounded-xl text-sm transition-all duration-200 appearance-none outline-none cursor-pointer",
                            "hover:border-border-strong",
                            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
                            "text-foreground",
                            error && "!border-rose-500 !bg-rose-50/50 dark:!bg-rose-500/5",
                            className
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
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

Select.displayName = "Select";
export { Select };
