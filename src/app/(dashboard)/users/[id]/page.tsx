"use client";

import { use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    ListTodo,
    FolderKanban,
    CheckCircle2,
    Clock,
    User as UserIcon,
    Crown,
} from "lucide-react";
import { useUsers, useTasks, useProjects } from "@/hooks";

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { users } = useUsers();
    const { tasks } = useTasks();
    const { projects } = useProjects();

    const user = users.find((u) => u.id === resolvedParams.id);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                    <UserIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-base font-bold text-foreground mb-2">User not found</h2>
                <Link href="/mentors" className="text-sm text-brand-500 hover:underline">
                    Back to Team
                </Link>
            </div>
        );
    }

    // Get user's tasks
    const userTasks = tasks.filter((t) => t.assigneeId === user.id);
    const completedTasks = userTasks.filter((t) => t.status === "DONE");
    const inProgressTasks = userTasks.filter((t) => t.status === "IN_PROGRESS");

    // Get user's projects (would need project membership data ideally)
    const userProjects = projects.slice(0, 3); // Placeholder

    return (
        <div className="max-w-[1000px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4 mb-8 pt-4">
                <Link
                    href="/mentors"
                    className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-surface shadow-sm mt-1"
                >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </Link>

                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                                    {user.name}
                                </h1>
                                {user.role === "ADMIN" && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase">
                                        <Crown className="w-3 h-3" />
                                        Admin
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="md:col-span-3 grid grid-cols-3 gap-4">
                    <div className="bg-surface rounded-lg border border-border p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <ListTodo className="w-4 h-4" />
                            <span className="text-xs font-medium">Total Tasks</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{userTasks.length}</div>
                    </div>
                    <div className="bg-surface rounded-lg border border-border p-4">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Completed</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{completedTasks.length}</div>
                    </div>
                    <div className="bg-surface rounded-lg border border-border p-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">In Progress</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{inProgressTasks.length}</div>
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="md:col-span-2 bg-surface rounded-lg border border-border p-5">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-muted-foreground" />
                        Assigned Tasks
                    </h3>

                    {userTasks.length > 0 ? (
                        <div className="space-y-2">
                            {userTasks.slice(0, 6).map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/tasks/${task.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${task.status === "DONE"
                                            ? "bg-emerald-500"
                                            : task.status === "IN_PROGRESS"
                                                ? "bg-amber-500"
                                                : "bg-zinc-400"
                                            }`}
                                    />
                                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                                        {task.title}
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                        {task.status.replace("_", " ")}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No assigned tasks
                        </div>
                    )}
                </div>

                {/* Projects */}
                <div className="bg-surface rounded-lg border border-border p-5">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        Projects
                    </h3>

                    {userProjects.length > 0 ? (
                        <div className="space-y-2">
                            {userProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: project.color }}
                                    >
                                        <FolderKanban className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {project.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Not in any projects
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
