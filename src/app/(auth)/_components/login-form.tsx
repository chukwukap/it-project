"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button, Input } from "@/components/ui";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password. Please try again.");
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
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

            <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
            />

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <span className="text-muted">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium">
                    Forgot password?
                </Link>
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                    </span>
                ) : (
                    "Sign in"
                )}
            </Button>

            <p className="text-center text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                    Create account
                </Link>
            </p>
        </form>
    );
}
