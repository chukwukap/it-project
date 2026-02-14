"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button, Input } from "@/components/ui";

export function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || "Something went wrong");
                setLoading(false);
                return;
            }

            // Auto sign in after registration
            await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            router.push("/");
            router.refresh();
        } catch {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                </div>
            )}

            <Input
                label="Full Name"
                type="text"
                placeholder="chukwuka uba"
                error={errors.name?.message}
                {...register("name")}
            />

            <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
            />

            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
            />

            <Button type="submit" className="w-full" loading={loading}>
                Create Account
            </Button>

            <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
