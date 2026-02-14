import { cn } from "@/lib/utils";

interface BadgeProps {
    variant?: "default" | "todo" | "in-progress" | "in-review" | "done" | "low" | "medium" | "high" | "urgent" | "outline" | "secondary";
    children: React.ReactNode;
    className?: string;
}

const variantStyles = {
    default: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20",
    secondary: "bg-secondary-50 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400 border border-secondary-100 dark:border-secondary-700",
    outline: "border border-border text-foreground bg-transparent",

    // Status
    todo: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20",
    "in-progress": "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400 border border-warning-100 dark:border-warning-500/20",
    "in-review": "bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700",
    done: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 border border-success-100 dark:border-success-500/20",

    // Priority
    low: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    medium: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    high: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
    urgent: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
