"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";

const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        if (!token) {
            setError("Invalid reset link. Please request a new one.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: data.password }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Invalid Reset Link</h1>
                    <p className="text-muted max-w-md mx-auto">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                </div>

                <Link href="/forgot-password">
                    <Button className="w-full">Request New Reset Link</Button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Password Reset!</h1>
                    <p className="text-muted max-w-md mx-auto">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>
                </div>

                <Link href="/login">
                    <Button className="w-full">Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
            </Link>

            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
                <p className="text-muted mt-2">
                    Enter your new password below
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-3 p-4 text-sm text-danger bg-danger-50 dark:bg-danger-500/10 rounded-xl border border-danger-100 dark:border-danger-500/20">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <Input
                    label="New password"
                    type="password"
                    placeholder="Enter your new password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <Input
                    label="Confirm password"
                    type="password"
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Resetting password...
                        </span>
                    ) : (
                        "Reset password"
                    )}
                </Button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
