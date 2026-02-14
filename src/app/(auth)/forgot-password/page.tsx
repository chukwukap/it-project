"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
                    <p className="text-muted max-w-md mx-auto">
                        We&apos;ve sent a password reset link to{" "}
                        <span className="font-semibold text-foreground">{getValues("email")}</span>
                    </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-medium mb-1">Didn&apos;t receive the email?</p>
                    <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-400">
                        <li>• Check your spam or junk folder</li>
                        <li>• Make sure the email address is correct</li>
                        <li>• Wait a few minutes and try again</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => setSuccess(false)}
                        variant="outline"
                        className="w-full"
                    >
                        Try another email
                    </Button>
                    <Link href="/login">
                        <Button variant="ghost" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to sign in
                        </Button>
                    </Link>
                </div>
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
                        <Mail className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-muted mt-2">
                    No worries, we&apos;ll send you reset instructions
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
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending reset link...
                        </span>
                    ) : (
                        "Reset password"
                    )}
                </Button>
            </form>
        </>
    );
}
