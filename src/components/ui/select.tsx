import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, id, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-bold text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-2.5 bg-surface-hover border-transparent rounded-xl text-sm transition-all appearance-none outline-none cursor-pointer",
                            "focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
                            "text-foreground",
                            error ? "border-danger-500 bg-danger-50/50 dark:bg-danger-500/10" : "",
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
                {error && (
                    <p className="text-sm font-medium text-danger-600 dark:text-danger-400">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
export { Select };
