import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /** Add hover lift effect */
    interactive?: boolean;
}

function Card({ className, children, interactive, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-surface rounded-xl border border-border shadow-sm",
                "transition-all duration-200",
                interactive && "hover:border-border-strong hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("px-6 py-4 border-b border-border/60", className)}
            {...props}
        >
            {children}
        </div>
    );
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-base font-bold text-foreground tracking-tight", className)}
            {...props}
        >
            {children}
        </h3>
    );
}

function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground mt-1", className)}
            {...props}
        >
            {children}
        </p>
    );
}

function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}

function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("px-6 py-4 border-t border-border/60 flex items-center gap-3", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
