"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Plus,
    FolderKanban,
    Users,
    FileText,
    Loader2,
    X,
    Sparkles,
    Folder,
    CheckCircle2,
    Clock,
    ArrowRight,
    BarChart2,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useProjects } from "@/hooks";
import { toast } from "sonner";

// Color options for projects
const projectColors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#06b6d4", // Cyan
    "#71717a", // Zinc
];

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const { createProject } = useProjects();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#6366f1",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Project name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            await createProject({
                name: formData.name,
                description: formData.description || undefined,
                color: formData.color,
            });

            toast.success("Project created successfully");
            setFormData({ name: "", description: "", color: "#6366f1" });
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create project";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg mx-4 bg-background rounded-2xl shadow-2xl border border-border animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                            <Folder className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">New Project</h2>
                            <p className="text-xs text-muted-foreground">Organize tasks into projects</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-xl flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <p className="font-medium text-rose-600 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Project Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Website Redesign"
                            className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What is this project about?"
                            rows={3}
                            className="w-full p-4 bg-surface border border-border rounded-xl text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Color Theme
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {projectColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${formData.color === color
                                        ? 'ring-2 ring-offset-2 ring-offset-background scale-110 shadow-lg'
                                        : 'hover:scale-105'
                                        }`}
                                    style={{
                                        backgroundColor: color
                                    }}
                                >
                                    {formData.color === color && <CheckCircle2 className="w-5 h-5 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.name.trim()}
                            className="flex-1 h-11 bg-brand-500 rounded-xl text-sm font-semibold text-white hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Project Stats Summary
function ProjectStats({ projects }: { projects: Array<{ _count: { tasks: number; members: number } }> }) {
    const stats = useMemo(() => {
        const totalTasks = projects.reduce((sum, p) => sum + p._count.tasks, 0);
        const totalMembers = new Set(projects.flatMap(p => p._count.members)).size;
        return { totalProjects: projects.length, totalTasks, totalMembers };
    }, [projects]);

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                    <p className="text-xs font-medium text-muted-foreground">Projects</p>
                </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
                    <p className="text-xs font-medium text-muted-foreground">Tasks</p>
                </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{projects.reduce((sum, p) => sum + p._count.members, 0)}</p>
                    <p className="text-xs font-medium text-muted-foreground">Members</p>
                </div>
            </div>
        </div>
    );
}

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        description: string | null;
        color: string;
        _count: { tasks: number; members: number };
        members: Array<{ user: { id: string; name: string; avatar: string | null } }>;
    };
}

function ProjectCard({ project }: ProjectCardProps) {
    // Calculate a mock progress based on # of tasks (in real app, would use completed vs total)
    const progress = project._count.tasks > 0 ? Math.min(Math.floor(Math.random() * 40) + 30, 100) : 0;

    return (
        <Link
            href={`/projects/${project.id}`}
            className="group flex flex-col h-full bg-surface rounded-2xl border border-border hover:border-border-strong hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden"
        >
            {/* Color Header Bar */}
            <div
                className="h-2 w-full"
                style={{ backgroundColor: project.color }}
            />

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}15` }}
                    >
                        <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
                    </div>

                    {/* Avatars Stack */}
                    {project.members.length > 0 && (
                        <div className="flex -space-x-2">
                            {project.members.slice(0, 4).map((member) => (
                                <div
                                    key={member.user.id}
                                    className="w-8 h-8 rounded-full border-2 border-surface bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-foreground"
                                    title={member.user.name}
                                >
                                    {member.user.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {project.members.length > 4 && (
                                <div className="w-8 h-8 rounded-full border-2 border-surface bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    +{project.members.length - 4}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div className="flex-1 mb-4">
                    <h3 className="text-base font-bold text-foreground group-hover:text-brand-500 transition-colors mb-1">
                        {project.name}
                    </h3>
                    {project.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground/50 italic">No description</p>
                    )}
                </div>

                {/* Progress Bar */}
                {project._count.tasks > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: project.color
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Stats Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{project._count.tasks}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{project._count.members}</span>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}

// Empty State
function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <FolderKanban className="w-12 h-12 text-brand-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No projects yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Projects help you organize related tasks together. Create your first project to get started.
            </p>
            <button
                onClick={onCreateProject}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold shadow-lg shadow-brand-500/20"
            >
                <Plus className="w-5 h-5" />
                Create Your First Project
            </button>
        </div>
    );
}

export default function ProjectsPage() {
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { projects, isLoading, error, mutate } = useProjects();

    // Filter projects by search
    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-20 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Projects
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all shadow-lg font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden">New</span>
                </button>
            </div>

            {/* Quick Stats */}
            {!isLoading && projects.length > 0 && <ProjectStats projects={projects} />}

            {/* Search */}
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-md h-11 pl-11 pr-4 bg-surface border border-border rounded-xl text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
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

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <p className="text-sm font-medium text-muted-foreground">Loading projects...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-800/30 text-center">
                    <p className="font-medium">Failed to load projects</p>
                    <button
                        onClick={() => mutate()}
                        className="mt-3 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            ) : projects.length === 0 ? (
                <EmptyState onCreateProject={() => setIsCreateModalOpen(true)} />
            ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-medium text-foreground mb-1">No matching projects</p>
                    <p className="text-xs text-muted-foreground mb-4">Try adjusting your search</p>
                    <button
                        onClick={() => setSearch("")}
                        className="text-sm text-brand-500 hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
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

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
