import { cn } from "@/lib/utils";

interface BadgeProps {
    variant?: "default" | "todo" | "in-progress" | "in-review" | "done" | "low" | "medium" | "high" | "urgent" | "outline" | "secondary";
    children: React.ReactNode;
    className?: string;
    /** Show a colored dot indicator before the text */
    dot?: boolean;
}

const variantStyles: Record<string, { classes: string; dotColor: string }> = {
    default: {
        classes: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20",
        dotColor: "bg-brand-500",
    },
    secondary: {
        classes: "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border border-border",
        dotColor: "bg-zinc-400",
    },
    outline: {
        classes: "border border-border text-foreground bg-transparent",
        dotColor: "bg-zinc-400",
    },

    // Status variants
    todo: {
        classes: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20",
        dotColor: "bg-brand-500",
    },
    "in-progress": {
        classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        dotColor: "bg-amber-500",
    },
    "in-review": {
        classes: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
        dotColor: "bg-violet-500",
    },
    done: {
        classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        dotColor: "bg-emerald-500",
    },

    // Priority variants
    low: {
        classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        dotColor: "bg-emerald-500",
    },
    medium: {
        classes: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20",
        dotColor: "bg-brand-500",
    },
    high: {
        classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        dotColor: "bg-amber-500",
    },
    urgent: {
        classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        dotColor: "bg-rose-500",
    },
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
    const style = variantStyles[variant] || variantStyles.default;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold transition-colors",
                style.classes,
                className
            )}
        >
            {dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dotColor)} />
            )}
            {children}
        </span>
    );
}
