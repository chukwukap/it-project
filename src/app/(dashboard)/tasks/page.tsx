"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Plus,
    Clock,
    Loader2,
    CheckCircle2,
    Circle,
    AlertTriangle,
    ArrowRight,
    Zap,
    Target,
    Filter,
    X,
    Keyboard,
    ChevronDown,
    LayoutGrid,
    List
} from "lucide-react";
import Link from "next/link";
import { useTasks } from "@/hooks";
import { CreateTaskModal } from "./_components/create-task-modal";

// Priority color mapping
const priorityColors = {
    LOW: "#10B981",
    MEDIUM: "#8B5CF6",
    HIGH: "#F59E0B",
    URGENT: "#EF4444",
};

const priorityLabels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
};

const statusConfig = {
    TODO: { label: "To Do", icon: Circle, color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", animate: false },
    IN_PROGRESS: { label: "In Progress", icon: Loader2, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", animate: true },
    IN_REVIEW: { label: "In Review", icon: Target, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", animate: false },
    DONE: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", animate: false },
};

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: keyof typeof statusConfig;
    priority: keyof typeof priorityColors;
    dueDate: string | null;
    project: { name: string; color: string };
    assignee: { name: string; avatar: string | null } | null;
}

// Quick Stats Component
function QuickStats({ tasks }: { tasks: Task[] }) {
    const stats = useMemo(() => ({
        todo: tasks.filter(t => t.status === "TODO").length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        inReview: tasks.filter(t => t.status === "IN_REVIEW").length,
        done: tasks.filter(t => t.status === "DONE").length,
        overdue: tasks.filter(t => {
            if (!t.dueDate || t.status === "DONE") return false;
            return new Date(t.dueDate) < new Date();
        }).length,
    }), [tasks]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.todo}</p>
                    <p className="text-xs font-medium text-muted-foreground">To Do</p>
                </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                    <p className="text-xs font-medium text-muted-foreground">Active</p>
                </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.inReview}</p>
                    <p className="text-xs font-medium text-muted-foreground">Review</p>
                </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.done}</p>
                    <p className="text-xs font-medium text-muted-foreground">Done</p>
                </div>
            </div>
            {stats.overdue > 0 && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-xl p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-rose-600">{stats.overdue}</p>
                        <p className="text-xs font-medium text-rose-600/70">Overdue</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Status Filter Pills
function StatusFilters({
    active,
    onChange
}: {
    active: string;
    onChange: (status: string) => void;
}) {
    const filters = [
        { value: "", label: "All Tasks", count: null },
        { value: "TODO", label: "To Do", icon: Circle },
        { value: "IN_PROGRESS", label: "In Progress", icon: Zap },
        { value: "IN_REVIEW", label: "In Review", icon: Target },
        { value: "DONE", label: "Done", icon: CheckCircle2 },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onChange(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active === filter.value
                        ? "bg-foreground text-background shadow-md"
                        : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                >
                    {filter.icon && <filter.icon className="w-4 h-4" />}
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

// Enhanced Task Card
function TaskCard({ task }: { task: Task }) {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE";
    const isDueToday = dueDate && dueDate.toDateString() === new Date().toDateString();
    const isDueTomorrow = dueDate && dueDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

    const formattedDate = dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const config = statusConfig[task.status];
    const StatusIcon = config.icon;

    let dateLabel = formattedDate;
    if (isOverdue) dateLabel = "Overdue";
    else if (isDueToday) dateLabel = "Today";
    else if (isDueTomorrow) dateLabel = "Tomorrow";

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="group block bg-surface border border-border rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg transition-all duration-200"
        >
            {/* Header: Project + Priority */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{
                        backgroundColor: `${task.project.color}15`,
                        color: task.project.color
                    }}
                >
                    {task.project.name}
                </span>
                <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-surface ring-current"
                    style={{ backgroundColor: priorityColors[task.priority], color: priorityColors[task.priority] }}
                    title={priorityLabels[task.priority]}
                />
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
                {task.title}
            </h3>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Footer: Status + Due Date + Assignee */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
                    <span>{config.label}</span>
                </div>

                <div className="flex items-center gap-2">
                    {dueDate && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-rose-500' : isDueToday ? 'text-amber-500' : 'text-muted-foreground'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {dateLabel}
                        </span>
                    )}
                    {task.assignee && (
                        <div
                            className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-foreground border-2 border-surface"
                            title={task.assignee.name}
                        >
                            {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Task List Item (compact view)
function TaskListItem({ task }: { task: Task }) {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE";
    const formattedDate = dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const config = statusConfig[task.status];
    const StatusIcon = config.icon;

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="flex items-center gap-4 p-3 bg-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-border hover:border-zinc-300 dark:hover:border-zinc-600 rounded-xl group transition-all"
        >
            <div className={`p-2 rounded-lg ${config.bg}`}>
                <StatusIcon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                    {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: task.project.color }}
                    >
                        {task.project.name}
                    </span>
                    {dueDate && (
                        <>
                            <span className="text-muted-foreground">•</span>
                            <span className={`text-[10px] font-medium ${isOverdue ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                {formattedDate}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: priorityColors[task.priority] }}
                />
                {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                        {task.assignee.name.charAt(0)}
                    </div>
                )}
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

// Empty State
function EmptyState({ onCreateTask, hasFilters }: { onCreateTask: () => void; hasFilters: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-brand-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
                {hasFilters ? "No matching tasks" : "All caught up!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {hasFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "You're doing great! Create a new task to keep the momentum going."
                }
            </p>
            <button
                onClick={onCreateTask}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold shadow-lg shadow-brand-500/20"
            >
                <Plus className="w-5 h-5" />
                Create Task
            </button>
        </div>
    );
}

export default function TasksPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [priorityFilter, setPriorityFilter] = useState<string>("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showKeyboardHint, setShowKeyboardHint] = useState(false);

    const { tasks, isLoading, error, mutate } = useTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
    });

    // Keyboard shortcut for creating task
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
            }
            if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.shiftKey &&
                document.activeElement?.tagName !== "INPUT" &&
                document.activeElement?.tagName !== "TEXTAREA") {
                e.preventDefault();
                setIsCreateModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const hasFilters = !!(search || statusFilter || priorityFilter);

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setPriorityFilter("");
    };

    return (
        <div className="min-h-screen pb-20 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Tasks
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {tasks.length} tasks total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowKeyboardHint(!showKeyboardHint)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-surface border border-border rounded-lg transition-colors"
                    >
                        <Keyboard className="w-4 h-4" />
                        Shortcuts
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all shadow-lg font-semibold text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Task</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {/* Keyboard Shortcuts Panel */}
            {showKeyboardHint && (
                <div className="bg-surface border border-border rounded-xl p-4 mb-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground">Keyboard Shortcuts</h3>
                        <button onClick={() => setShowKeyboardHint(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">N</kbd>
                            <span className="text-muted-foreground">New task</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">⌘K</kbd>
                            <span className="text-muted-foreground">Search</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            {!isLoading && tasks.length > 0 && <QuickStats tasks={tasks} />}

            {/* Search + Filters */}
            <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search tasks... (⌘K)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-surface border border-border rounded-xl text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Priority Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="h-11 pl-4 pr-10 bg-surface border border-border rounded-xl text-sm font-medium appearance-none cursor-pointer outline-none focus:border-brand-500"
                        >
                            <option value="">All Priorities</option>
                            <option value="URGENT">🔴 Urgent</option>
                            <option value="HIGH">🟠 High</option>
                            <option value="MEDIUM">🟣 Medium</option>
                            <option value="LOW">🟢 Low</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center bg-surface border border-border rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-3 transition-colors ${viewMode === "list" ? "bg-zinc-100 dark:bg-zinc-800 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-3 transition-colors ${viewMode === "grid" ? "bg-zinc-100 dark:bg-zinc-800 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Status Filter Pills */}
                <StatusFilters active={statusFilter} onChange={setStatusFilter} />

                {/* Active Filters */}
                {hasFilters && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Active filters:</span>
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <p className="text-sm font-medium text-muted-foreground">Loading tasks...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-800/30 text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Failed to load tasks</p>
                    <button
                        onClick={() => mutate()}
                        className="mt-3 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            ) : tasks.length === 0 ? (
                <EmptyState onCreateTask={() => setIsCreateModalOpen(true)} hasFilters={hasFilters} />
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2 animate-fade-in">
                    {tasks.map((task) => (
                        <TaskListItem key={task.id} task={task} />
                    ))}
                </div>
            )}

            {/* Floating Action Button (Mobile) */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-brand-500 text-white rounded-full shadow-xl shadow-brand-500/30 flex items-center justify-center hover:bg-brand-600 transition-colors z-40"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
