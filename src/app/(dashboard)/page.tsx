"use client";

import { useSession } from "next-auth/react";
import { useDashboard, useTasks } from "@/hooks";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronRight as ChevronRightIcon,
    Clock,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    Briefcase,
    ArrowUpRight,
    BarChart3,
    Target,
    Zap,
    FolderKanban,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

/* ==========================================================================
   PRIORITY CONFIG
   ========================================================================== */
const priorityConfig = {
    LOW: { color: "#10B981", label: "Low", bg: "bg-emerald-500/10", text: "text-emerald-500" },
    MEDIUM: { color: "#6366f1", label: "Medium", bg: "bg-brand-500/10", text: "text-brand-500" },
    HIGH: { color: "#F59E0B", label: "High", bg: "bg-amber-500/10", text: "text-amber-500" },
    URGENT: { color: "#EF4444", label: "Urgent", bg: "bg-rose-500/10", text: "text-rose-500" },
};

/* ==========================================================================
   LOADING STATE
   ========================================================================== */
function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                    <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="h-10 w-28 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-80 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                <div className="h-80 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
            </div>
        </div>
    );
}

/* ==========================================================================
   STAT CARD — Glass-morphic with gradient accent
   ========================================================================== */
function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    accentColor = "#6366f1",
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: number;
    accentColor?: string;
}) {
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div className="relative group bg-surface border border-border rounded-xl p-5 overflow-hidden transition-all duration-300 hover:border-border-strong hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
            {/* Accent glow */}
            <div
                className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ background: accentColor }}
            />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                        <Icon className="w-4 h-4" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            <ArrowUpRight className={`w-3 h-3 ${!isPositive ? 'rotate-90' : ''}`} />
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <p className="text-3xl font-extrabold text-foreground tracking-tighter leading-none mb-1">{value}</p>
                <p className="text-xs font-medium text-muted-foreground">{title}</p>
            </div>
        </div>
    );
}

/* ==========================================================================
   COMPLETION RING — SVG donut chart
   ========================================================================== */
function CompletionRing({ percentage }: { percentage: number }) {
    const circumference = 2 * Math.PI * 42;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    strokeWidth="6"
                    className="stroke-zinc-100 dark:stroke-zinc-800"
                />
                {/* Progress */}
                <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="stroke-brand-500 transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-foreground tracking-tighter">{percentage}%</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Done</span>
            </div>
        </div>
    );
}

/* ==========================================================================
   ACTIVITY CHART — Refined area chart
   ========================================================================== */
function ActivityChart({ data }: { data: { day: string; completed: number }[] }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Activity</h3>
                        <p className="text-[11px] text-muted-foreground">Tasks completed this week</p>
                    </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800 rounded-full px-2.5 py-1">
                    7 days
                </span>
            </div>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            dx={-4}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border)',
                                borderRadius: '10px',
                                color: 'var(--foreground)',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '8px 14px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#activityGradient)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#6366f1' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ==========================================================================
   MINI CALENDAR
   ========================================================================== */
function MiniCalendar() {
    const today = new Date();
    const currentMonth = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    return (
        <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{currentMonth}</h3>
                </div>
                <div className="flex items-center gap-0.5">
                    <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, i) => (
                    <div
                        key={i}
                        className={`
                            h-8 flex items-center justify-center text-xs font-medium rounded-md transition-all
                            ${day === null ? '' : 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'}
                            ${day === today.getDate() ? '!bg-brand-500 !text-white !font-bold shadow-md shadow-brand-500/30' : ''}
                        `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ==========================================================================
   RUNNING TASK CARD — Enhanced with priority badge
   ========================================================================== */
function RunningTaskCard({
    task,
}: {
    task: {
        id: string;
        title: string;
        project: { name: string; color: string };
        priority: string;
    };
}) {
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    const progress = Math.floor(Math.random() * 40) + 40; // 40-80% mock progress

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="group flex flex-col bg-surface border border-border rounded-xl p-5 transition-all duration-300 hover:border-border-strong hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
        >
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${priority.bg} ${priority.text}`}>
                    {priority.label}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug">
                {task.title}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">
                {task.project.name}
            </p>

            <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Progress</span>
                    <span className="text-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${priority.color}, ${priority.color}cc)`,
                        }}
                    />
                </div>
            </div>
        </Link>
    );
}

/* ==========================================================================
   UPCOMING TASK ITEM — Clean list row
   ========================================================================== */
function UpcomingTaskItem({
    task,
}: {
    task: {
        id: string;
        title: string;
        dueDate: string;
        priority: string;
        project: { name: string; color: string };
    };
}) {
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < new Date();
    const formattedDate = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border-b border-border/50 last:border-0"
        >
            <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: priority.color }}
            />
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate group-hover:text-brand-500 transition-colors">
                    {task.title}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                    {task.project.name} · <span className={isOverdue ? "text-rose-500 font-semibold" : ""}>{isOverdue ? "Overdue" : formattedDate}</span>
                </p>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

/* ==========================================================================
   MAIN DASHBOARD PAGE
   ========================================================================== */
export default function DashboardPage() {
    const { data: session } = useSession();
    const { stats, recentTasks, upcomingTasks, activityData, isLoading: dashboardLoading } = useDashboard();
    const { tasks: inProgressTasks, isLoading: tasksLoading } = useTasks({ status: "IN_PROGRESS" });

    const isLoading = dashboardLoading || tasksLoading;
    const userName = session?.user?.name?.split(" ")[0] || "User";
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8 pb-16">
            {/* ============================================================
               HEADER — Greeting + Completion Ring + Quick Actions
               ============================================================ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    {/* Completion Ring */}
                    <div className="hidden sm:block">
                        <CompletionRing percentage={stats?.completionRate ?? 0} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                            {greeting}, {userName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                            {stats?.inProgressTasks ? (
                                <>You have <span className="text-brand-500 font-semibold">{stats.inProgressTasks} active tasks</span> and <span className="text-foreground font-semibold">{stats?.upcomingDeadlines ?? 0} deadlines</span> this week.</>
                            ) : (
                                <>Your workspace is clear. Start something new!</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/tasks"
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </Link>
                    <Link
                        href="/projects"
                        className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border text-sm font-semibold rounded-xl hover:bg-surface-hover hover:border-border-strong transition-all text-foreground"
                    >
                        <FolderKanban className="w-4 h-4" />
                        <span className="hidden sm:inline">New Project</span>
                    </Link>
                </div>
            </div>

            {/* ============================================================
               STATS ROW — 4 glass-morphic metric cards
               ============================================================ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Tasks"
                    value={stats?.totalTasks ?? 0}
                    icon={Briefcase}
                    trend={4}
                    accentColor="#6366f1"
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedTasks ?? 0}
                    icon={CheckCircle2}
                    trend={stats?.completionRate}
                    accentColor="#10b981"
                />
                <StatCard
                    title="In Progress"
                    value={stats?.inProgressTasks ?? 0}
                    icon={Zap}
                    accentColor="#f59e0b"
                />
                <StatCard
                    title="Projects"
                    value={stats?.projectCount ?? 0}
                    icon={FolderKanban}
                    accentColor="#8b5cf6"
                />
            </div>

            {/* ============================================================
               BENTO GRID — Chart (2/3) + Calendar (1/3)
               ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ActivityChart data={activityData} />
                </div>
                <div className="lg:col-span-1">
                    <MiniCalendar />
                </div>
            </div>

            {/* ============================================================
               BOTTOM SECTION — Running Tasks (2/3) + Upcoming (1/3)
               ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Running Tasks */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">In Progress</h3>
                                <p className="text-[11px] text-muted-foreground">{inProgressTasks.length} tasks running</p>
                            </div>
                        </div>
                        <Link href="/tasks" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inProgressTasks.length > 0 ? (
                            inProgressTasks.slice(0, 4).map((task) => (
                                <RunningTaskCard key={task.id} task={task} />
                            ))
                        ) : (
                            <div className="col-span-2 bg-surface border border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Target className="w-5 h-5 opacity-40" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground/60">No tasks in progress</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Pick a task to start working on</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Deadlines</h3>
                                <p className="text-[11px] text-muted-foreground">Coming up soon</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        {upcomingTasks.length > 0 ? (
                            upcomingTasks.slice(0, 5).map((task) => (
                                <UpcomingTaskItem key={task.id} task={task} />
                            ))
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 opacity-40" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground/60">All caught up!</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">No upcoming deadlines</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
