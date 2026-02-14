"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
                    title: "group-[.toast]:text-foreground group-[.toast]:font-semibold group-[.toast]:text-sm",
                    description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
                    actionButton:
                        "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:rounded-md",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:rounded-md",
                    success: "group-[.toaster]:border-emerald-500 group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-950/20",
                    error: "group-[.toaster]:border-rose-500 group-[.toaster]:bg-rose-50 dark:group-[.toaster]:bg-rose-950/20",
                },
            }}
            position="bottom-right"
            richColors
            {...props}
        />
    );
}
