import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus-visible:ring-primary-500",
            secondary: "bg-surface-hover text-foreground hover:bg-secondary-200 dark:hover:bg-secondary-700 focus-visible:ring-secondary-500",
            danger: "bg-danger text-white hover:bg-danger-600 active:bg-danger-600 shadow-lg shadow-danger/25 focus-visible:ring-danger",
            success: "bg-success text-white hover:bg-success-600 active:bg-success-600 shadow-lg shadow-success/25 focus-visible:ring-success",
            ghost: "text-muted hover:bg-surface-hover hover:text-foreground focus-visible:ring-primary-500",
            outline: "border-2 border-border bg-transparent hover:bg-surface-hover text-foreground focus-visible:ring-primary-500",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2.5 text-sm",
            lg: "px-6 py-3 text-base",
            icon: "p-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
export { Button };
