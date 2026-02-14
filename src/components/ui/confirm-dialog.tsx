"use client";

import { useState, useEffect, useCallback } from "react";
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

    // Close on Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) onClose();
    }, [onClose, isLoading]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

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
            icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            button: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-lg shadow-rose-500/25",
        },
        warning: {
            icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            button: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-lg shadow-amber-500/25",
        },
        default: {
            icon: "bg-zinc-100 dark:bg-zinc-800 text-foreground",
            button: "bg-foreground text-background hover:opacity-90",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-sm animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${styles.icon}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-border-strong transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.97] ${styles.button}`}
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
