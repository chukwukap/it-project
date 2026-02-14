"use client";

import { useSession } from "next-auth/react";
import { useDashboard, useTasks } from "@/hooks";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    MoreHorizontal,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    Briefcase,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// Priority color mapping
const priorityColors = {
    LOW: "#10B981",    // Success
    MEDIUM: "#8B5CF6", // Primary
    HIGH: "#F59E0B",   // Warning
    URGENT: "#EF4444", // Danger
};

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing dashboard...</p>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    className = ""
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: number;
    className?: string;
}) {
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div className={`bg-surface p-6 flex flex-col justify-between group ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-muted-foreground group-hover:text-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-foreground tracking-tighter mb-1">{value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
}

function RunningTaskCard({
    task
}: {
    task: {
        id: string;
        title: string;
        project: { name: string; color: string };
        priority: string;
    }
}) {
    // Calculate a mock progress
    const progress = 65;

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="group flex flex-col bg-surface hover:bg-surface-hover p-5 border border-border rounded-lg transition-all duration-200"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                    {task.project.name}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-4 line-clamp-2 group-hover:text-brand-500 transition-colors">
                {task.title}
            </h3>

            <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </Link>
    );
}

function UpcomingTaskItem({
    task
}: {
    task: {
        id: string;
        title: string;
        dueDate: string;
        priority: string;
        project: { name: string; color: string };
    }
}) {
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < new Date();
    const formattedDate = dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-border transition-colors group"
        >
            <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] }}
            />
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate group-hover:text-brand-500 transition-colors">
                    {task.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">{task.project.name} • <span className={isOverdue ? "text-rose-500 font-medium" : ""}>{formattedDate}</span></p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </Link>
    );
}

function MiniCalendar() {
    const today = new Date();
    const currentMonth = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Generate calendar days
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{currentMonth}</h3>
                <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                    <div
                        key={i}
                        className={`
              h-8 flex items-center justify-center text-xs font-medium rounded-md transition-all
              ${day === null ? '' : 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'}
              ${day === today.getDate()
                                ? '!bg-brand-500 !text-white !font-bold'
                                : ''}
            `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const { stats, recentTasks, upcomingTasks, activityData, isLoading: dashboardLoading } = useDashboard();
    const { tasks: inProgressTasks, isLoading: tasksLoading } = useTasks({ status: "IN_PROGRESS" });

    const isLoading = dashboardLoading || tasksLoading;
    const userName = session?.user?.name?.split(" ")[0] || "User";
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen pb-20 space-y-6">
            {/* Header - Enhanced with Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                <div className="flex items-start gap-4">
                    {/* Completion Ring */}
                    <div className="relative w-16 h-16 hidden sm:block">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-zinc-800" />
                            <circle
                                cx="32" cy="32" r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(stats?.completionRate ?? 0) * 1.76} 176`}
                                className="text-brand-500 transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">{stats?.completionRate ?? 0}%</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {greeting}, {userName} 👋
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats?.inProgressTasks ? (
                                <>You have <span className="text-brand-500 font-semibold">{stats.inProgressTasks} active tasks</span> to focus on today.</>
                            ) : (
                                <>Ready to be productive today?</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Link
                        href="/tasks"
                        className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-all shadow-lg"
                    >
                        <Sparkles className="w-4 h-4" />
                        New Task
                    </Link>
                    <Link
                        href="/projects"
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-foreground"
                    >
                        <Briefcase className="w-4 h-4" />
                        <span className="hidden sm:inline">New Project</span>
                        <span className="sm:hidden">Project</span>
                    </Link>
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:grid-rows-2">

                {/* STATS - Top Row (takes 2 cols, 1 row on md) */}
                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-sm">
                    <StatCard
                        title="Total Tasks"
                        value={stats?.totalTasks ?? 0}
                        icon={Briefcase}
                        trend={4} // Mock trend
                    />
                    <StatCard
                        title="Completed"
                        value={stats?.completedTasks ?? 0}
                        icon={CheckCircle2}
                        trend={stats?.completionRate}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats?.inProgressTasks ?? 0}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Upcoming"
                        value={stats?.upcomingDeadlines ?? 0}
                        icon={AlertCircle}
                    />
                </div>

                {/* ACTIVITY CHART - Left Big Block */}
                <div className="md:col-span-3 bg-surface border border-border rounded-xl shadow-sm p-6 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            Activity Overview
                        </h3>
                        <div className="flex items-center text-xs font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800 rounded-md px-2 py-1">
                            Last 7 Days
                        </div>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a1a1aa' }} // Zinc-400
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--foreground)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CALENDAR - Right Small Block */}
                <div className="md:col-span-1 bg-surface border border-border rounded-xl shadow-sm">
                    <MiniCalendar />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* running tasks */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Running Now</h3>
                        <Link href="/tasks" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inProgressTasks.length > 0 ? (
                            inProgressTasks.slice(0, 2).map(task => (
                                <RunningTaskCard key={task.id} task={task} />
                            ))
                        ) : (
                            <div className="col-span-2 p-8 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <Briefcase className="w-8 h-8 opacity-20" />
                                <span className="text-sm">No tasks running</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Upcoming Deadlines</h3>
                    </div>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                        {upcomingTasks.slice(0, 5).map(task => (
                            <UpcomingTaskItem key={task.id} task={task} />
                        ))}
                        {upcomingTasks.length === 0 && (
                            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <CheckCircle2 className="w-8 h-8 opacity-20" />
                                <span className="text-sm">All caught up!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
