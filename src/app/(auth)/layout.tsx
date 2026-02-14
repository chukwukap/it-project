import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 30%, #818cf8 60%, #4f46e5 100%)' }}
            >
                {/* Animated floating orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" style={{ animation: 'orbFloat 20s ease-in-out infinite' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" style={{ animation: 'orbFloat 15s ease-in-out infinite reverse' }} />

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl">Taskify</span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Streamline your workflow, amplify your productivity
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed">
                            Join thousands of teams who trust Taskify to manage projects,
                            collaborate seamlessly, and deliver results faster.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[
                                "https://randomuser.me/api/portraits/women/44.jpg",
                                "https://randomuser.me/api/portraits/men/32.jpg",
                                "https://randomuser.me/api/portraits/women/68.jpg",
                                "https://randomuser.me/api/portraits/men/75.jpg",
                            ].map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`User ${i + 1}`}
                                    className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                                />
                            ))}
                        </div>
                        <p className="text-white/80 text-sm">
                            <span className="font-semibold text-white">2,500+</span> people already joined
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl text-foreground">Taskify</span>
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-8 shadow-xl shadow-black/5">
                        {children}
                    </div>

                    <p className="text-center text-sm text-muted mt-6">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
