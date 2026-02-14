"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, Calendar, User, Briefcase, FileText } from "lucide-react";
import { useTasks, useProjects, useUsers } from "@/hooks";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
    const { data: session } = useSession();
    const { createTask } = useTasks();
    const { projects, isLoading: projectsLoading } = useProjects();
    const { users, isLoading: usersLoading } = useUsers();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO" as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
        priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        projectId: "",
        assigneeId: "",
        dueDate: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title.trim()) {
            setError("Title is required");
            return;
        }

        if (!formData.projectId) {
            setError("Please select a project");
            return;
        }

        setIsSubmitting(true);

        try {
            await createTask({
                title: formData.title,
                description: formData.description || undefined,
                status: formData.status,
                priority: formData.priority,
                projectId: formData.projectId,
                assigneeId: formData.assigneeId || session?.user?.id || null,
                dueDate: formData.dueDate || null,
            });

            toast.success("Task created successfully");

            // Reset form and close
            setFormData({
                title: "",
                description: "",
                status: "TODO",
                priority: "MEDIUM",
                projectId: "",
                assigneeId: "",
                dueDate: "",
            });
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create task";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-surface rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-bg-surface md:scale-100 scale-95 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            Create New Task
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-xl transition-colors text-muted hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <p className="text-sm font-medium text-danger-700 dark:text-danger-400">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">
                            Task Title <span className="text-primary-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="What needs to be done?"
                                className="w-full h-12 pl-4 pr-4 bg-surface-hover border-transparent rounded-xl text-sm transition-all focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <FileText className="w-4 h-4 text-primary-500" />
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details about this task..."
                            rows={3}
                            className="w-full p-4 bg-surface-hover border-transparent rounded-xl text-sm transition-all focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <Briefcase className="w-4 h-4 text-primary-500" />
                                Project <span className="text-primary-500">*</span>
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full h-12 px-4 bg-surface-hover border-transparent rounded-xl text-sm transition-all focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none cursor-pointer"
                                disabled={projectsLoading}
                            >
                                <option value="">Select Project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <User className="w-4 h-4 text-primary-500" />
                                Assignee
                            </label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full h-12 px-4 bg-surface-hover border-transparent rounded-xl text-sm transition-all focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none cursor-pointer"
                                disabled={usersLoading}
                            >
                                <option value="">Assign to me</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wide">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none cursor-pointer"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wide">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
                                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none cursor-pointer"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full h-12 px-4 bg-surface-hover border-transparent rounded-xl text-sm transition-all focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-border sticky bottom-0 bg-surface pb-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 border border-border rounded-xl text-sm font-bold text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-12 bg-primary-500 rounded-xl text-sm font-bold text-white hover:bg-primary-600 active:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
