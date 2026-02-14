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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-500/20">
            {/* Desktop Sidebar - Minimalist & Seamless */}
            <aside className="hidden lg:flex flex-col w-[240px] fixed left-0 top-0 bottom-0 z-30 bg-background/50 backdrop-blur-xl border-r border-border">
                {/* Logo Area */}
                <div className="h-14 flex items-center px-6 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
                            <Command className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">Taskify</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-0.5">
                    <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        Workspace
                    </div>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm group ${isActive(item.href)
                                ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 transition-colors ${isActive(item.href) ? 'text-brand-500' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={2} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-border/50">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover transition-colors cursor-pointer group">
                        <div
                            className="w-8 h-8 rounded bg-gradient-cosmos flex items-center justify-center text-xs font-bold text-white shadow-inner border border-white/10"
                        >
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                                {userName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                Pro Plan
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-background transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
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
            <div className="lg:pl-[240px]">
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
