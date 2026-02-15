"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Globe, Bell, MessageSquare, CheckCircle, AlertCircle, Users, Loader2, Save, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useCurrentUser } from "@/hooks";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

type Tab = "general" | "notifications";

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 focus:ring-offset-surface ${enabled ? 'bg-brand-500 shadow-inner shadow-brand-600/20' : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

function ThemeOption({
    icon: Icon,
    label,
    value,
    currentValue,
    onChange
}: {
    icon: typeof Sun;
    label: string;
    value: string;
    currentValue: string;
    onChange: (value: string) => void;
}) {
    const isActive = currentValue === value;

    return (
        <button
            onClick={() => onChange(value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 w-full sm:w-auto ${isActive
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                : 'border-border bg-surface text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground'
                }`}
        >
            <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-muted-foreground/70'}`} strokeWidth={2} />
            <span className="text-sm">
                {label}
            </span>
        </button>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const { user, isLoading, updateProfile } = useCurrentUser();

    // Form state
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Notification settings
    const [notifications, setNotifications] = useState({
        messages: true,
        taskUpdates: true,
        taskDeadline: true,
        mentorHelp: false,
    });

    // General settings
    const [language, setLanguage] = useState("english");
    const [timezone, setTimezone] = useState("utc");
    const [timeFormat, setTimeFormat] = useState("12h");

    // Initialize name
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim() || name.trim().length < 2) {
            toast.error('Name too short');
            return;
        }

        setIsSaving(true);

        try {
            await updateProfile({ name: name.trim() });
            toast.success('Profile saved successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="min-h-screen max-w-5xl mx-auto pb-20 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground">Manage your workspace and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "general"
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "notifications"
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Notifications
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Sidebar navigation for settings could go here in future, 
                   using a 2-col layout for settings content vs TOC */}

                <div className="md:col-span-2 space-y-6">
                    {activeTab === "general" ? (
                        <>
                            {/* Profile Section */}
                            <section className="bg-surface rounded-xl border border-border hover:border-border-strong p-6 shadow-sm transition-colors">
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand-500" />
                                    Profile
                                </h2>

                                {isLoading ? (
                                    <div className="py-8 flex justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=6366f1,8b5cf6&backgroundType=gradientLinear&fontSize=36`}
                                                alt={user?.name || 'User'}
                                                className="w-16 h-16 rounded-xl object-cover shadow-md"
                                            />
                                            <div>
                                                <p className="text-base font-bold text-foreground">
                                                    {user?.name || "User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="max-w-sm">
                                            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-border rounded-lg text-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving || name === user?.name}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wide active:scale-[0.97]"
                                            >
                                                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Theme Section */}
                            <section className="bg-surface rounded-xl border border-border hover:border-border-strong p-6 shadow-sm transition-colors">
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-brand-500" />
                                    Appearance
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    <ThemeOption
                                        icon={Sun}
                                        label="Light"
                                        value="light"
                                        currentValue={theme}
                                        onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                                    />
                                    <ThemeOption
                                        icon={Moon}
                                        label="Dark"
                                        value="dark"
                                        currentValue={theme}
                                        onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                                    />
                                    <ThemeOption
                                        icon={Monitor}
                                        label="System"
                                        value="system"
                                        currentValue={theme}
                                        onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                                    />
                                </div>
                            </section>

                            {/* Regional Settings */}
                            <section className="bg-surface rounded-xl border border-border hover:border-border-strong p-6 shadow-sm transition-colors">
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-brand-500" />
                                    Region
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Language</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full h-9 px-3 bg-white dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none"
                                        >
                                            <option value="english">English (US)</option>
                                            <option value="spanish">Spanish</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timezone</label>
                                        <select
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="w-full h-9 px-3 bg-white dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none"
                                        >
                                            <option value="utc">UTC</option>
                                            <option value="est">EST</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Danger Zone */}
                            <section className="bg-rose-50 dark:bg-rose-950/10 rounded-xl border border-rose-200 dark:border-rose-900/30 p-6">
                                <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2">
                                    Danger Zone
                                </h2>
                                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mb-4">
                                    Once you sign out, you will need to log in again to access your account.
                                </p>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors uppercase tracking-wide"
                                >
                                    Sign Out
                                </button>
                            </section>
                        </>
                    ) : (
                        <section className="bg-surface rounded-xl border border-border hover:border-border-strong p-6 shadow-sm transition-colors">
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-brand-500" />
                                Notification Preferences
                            </h2>

                            <div className="space-y-6">
                                {[
                                    { key: 'messages', icon: MessageSquare, title: 'Messages', desc: 'Direct messages and mentions' },
                                    { key: 'taskUpdates', icon: CheckCircle, title: 'Task Updates', desc: 'Status changes on your tasks' },
                                    { key: 'taskDeadline', icon: AlertCircle, title: 'Deadlines', desc: 'Reminders for upcoming due dates' },
                                    { key: 'mentorHelp', icon: Users, title: 'Team Activity', desc: 'New members and project updates' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between pb-6 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-muted-foreground">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            enabled={notifications[item.key as keyof typeof notifications]}
                                            onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
