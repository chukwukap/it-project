"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Confirm action failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const variantStyles = {
        danger: {
            icon: "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
            button: "bg-rose-600 hover:bg-rose-700 text-white",
        },
        warning: {
            icon: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
            button: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        default: {
            icon: "bg-zinc-100 dark:bg-zinc-800 text-foreground",
            button: "bg-foreground text-background hover:opacity-90",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-background rounded-lg border border-border shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${styles.icon}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{description}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-10 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${styles.button}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
