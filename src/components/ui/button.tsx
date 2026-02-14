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
        const baseStyles = [
            "inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
            "active:scale-[0.97]",
        ].join(" ");

        const variants = {
            primary: [
                "bg-brand-500 text-white",
                "hover:bg-brand-600",
                "active:bg-brand-700",
                "shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30",
                "focus-visible:ring-brand-500",
            ].join(" "),
            secondary: [
                "bg-zinc-100 dark:bg-zinc-800 text-foreground",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "focus-visible:ring-zinc-500",
            ].join(" "),
            danger: [
                "bg-rose-600 text-white",
                "hover:bg-rose-700",
                "active:bg-rose-800",
                "shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30",
                "focus-visible:ring-rose-500",
            ].join(" "),
            success: [
                "bg-emerald-600 text-white",
                "hover:bg-emerald-700",
                "active:bg-emerald-800",
                "shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30",
                "focus-visible:ring-emerald-500",
            ].join(" "),
            ghost: [
                "text-muted-foreground",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground",
                "focus-visible:ring-zinc-500",
            ].join(" "),
            outline: [
                "border border-border bg-transparent text-foreground",
                "hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-border-strong",
                "focus-visible:ring-zinc-500",
            ].join(" "),
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
