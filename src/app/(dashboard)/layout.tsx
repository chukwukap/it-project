"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutGrid,
    CheckSquare,
    Users,
    MessageSquare,
    Settings,
    Menu,
    Bell,
    LogOut,
    FolderKanban,
    Loader2,
    X,
    Sparkles,
    Command,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Team", href: "/mentors", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        }
    }, [status, router, pathname]);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    const userName = session?.user?.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    // Show loading state while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Don't render if unauthenticated (will redirect)
    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-500/20 relative">
            {/* === PREMIUM BACKGROUND EFFECTS (fffuel.co inspired) === */}
            {/* Dot grid overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.4,
                }}
            />
            {/* Top spotlight glow */}
            <div
                className="fixed top-0 left-0 right-0 h-[600px] pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)',
                }}
            />
            {/* Floating gradient orb - top right */}
            <div
                className="fixed top-[-100px] right-[-50px] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
                    filter: 'blur(40px)',
                    animation: 'orbFloat 20s ease-in-out infinite',
                }}
            />
            {/* Floating gradient orb - bottom left */}
            <div
                className="fixed bottom-[-80px] left-[-40px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
                    filter: 'blur(30px)',
                    animation: 'orbFloat 25s ease-in-out infinite reverse',
                }}
            />
            {/* Noise grain texture */}
            <div
                className="fixed inset-0 pointer-events-none z-[1]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    opacity: 0.03,
                    mixBlendMode: 'overlay' as const,
                }}
            />
            {/* === END BACKGROUND EFFECTS === */}

            {/* Desktop Sidebar — Premium with accent indicators */}
            <aside className="hidden lg:flex flex-col w-[240px] fixed left-0 top-0 bottom-0 z-30 bg-surface/80 backdrop-blur-xl border-r border-border">
                {/* Logo Area */}
                <div className="h-14 flex items-center px-5 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white transition-transform group-hover:scale-105">
                            <Command className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-sm tracking-tight">Taskify</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Navigation
                    </div>
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${active
                                    ? "bg-brand-500/10 text-foreground font-semibold"
                                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                    }`}
                            >
                                {/* Left accent indicator */}
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-full" />
                                )}
                                <item.icon
                                    className={`w-[18px] h-[18px] transition-colors ${active ? 'text-brand-500' : 'text-muted-foreground/70 group-hover:text-foreground'}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-border/50">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group"
                    >
                        <img
                            src={session?.user?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=6366f1,8b5cf6&backgroundType=gradientLinear&fontSize=40`}
                            alt={userName}
                            className="w-9 h-9 rounded-lg object-cover shadow-md shadow-brand-500/20"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                                {userName}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 truncate">
                                {session?.user?.email?.split("@")[0] || "Member"}
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSignOut(); }}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-xl border-b border-border z-50 px-4 flex items-center justify-between">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-brand-500 flex items-center justify-center text-white">
                        <Command className="w-3 h-3" />
                    </div>
                    Taskify
                </div>

                <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full ring-2 ring-background"></span>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background/90 backdrop-blur-sm animate-fade-in">
                    <div className="flex flex-col h-full p-4">
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-bold text-lg tracking-tight">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="space-y-1 flex-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                        ? "bg-brand-500/10 text-brand-500"
                                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="pt-8 border-t border-border">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-danger-500 hover:bg-danger-500/10 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="lg:pl-[240px] relative z-2">
                {/* Desktop Topbar - Minimal */}
                <header className="hidden lg:flex h-14 bg-background/50 backdrop-blur-xl border-b border-border items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="hover:text-foreground transition-colors cursor-pointer">Workspace</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">{navigation.find(n => isActive(n.href))?.name || "Dashboard"}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <main className="p-6 lg:p-10 max-w-[1600px] mx-auto animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
