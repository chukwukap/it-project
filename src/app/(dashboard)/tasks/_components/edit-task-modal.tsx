"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Edit3, Calendar, User, Briefcase, FileText } from "lucide-react";
import { useTasks, useProjects, useUsers } from "@/hooks";
import { toast } from "sonner";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    projectId: string;
    assigneeId: string | null;
    dueDate: string | null;
}

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onSuccess?: () => void;
}

export function EditTaskModal({ isOpen, onClose, task, onSuccess }: EditTaskModalProps) {
    const { updateTask } = useTasks();
    const { projects, isLoading: projectsLoading } = useProjects();
    const { users, isLoading: usersLoading } = useUsers();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO" as Task["status"],
        priority: "MEDIUM" as Task["priority"],
        projectId: "",
        assigneeId: "",
        dueDate: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Populate form when task changes
    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                projectId: task.projectId,
                assigneeId: task.assigneeId || "",
                dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
            });
        }
    }, [task, isOpen]);

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
            await updateTask(task.id, {
                title: formData.title,
                description: formData.description || undefined,
                status: formData.status,
                priority: formData.priority,
                projectId: formData.projectId,
                assigneeId: formData.assigneeId || null,
                dueDate: formData.dueDate || null,
            });

            toast.success("Task updated successfully");
            onSuccess?.();
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update task";
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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-background rounded-lg border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            <Edit3 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                            Edit Task
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-lg">
                            <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                            Title <span className="text-brand-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wide">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details about this task..."
                            rows={3}
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Project */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wide">
                                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                Project <span className="text-brand-500">*</span>
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none cursor-pointer"
                                disabled={projectsLoading}
                            >
                                <option value="">Select</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wide">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                Assignee
                            </label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none cursor-pointer"
                                disabled={usersLoading}
                            >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none cursor-pointer"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none cursor-pointer"
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
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wide">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:border-brand-500 outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-10 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-10 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
