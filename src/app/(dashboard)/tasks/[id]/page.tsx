"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Clock,
    Send,
    Loader2,
    CheckCircle2,
    Edit3,
    Trash2,
    MessageSquare,
    Sparkles,
    Calendar,
    Briefcase,
    Circle
} from "lucide-react";
import Link from "next/link";
import { useTask, useTasks } from "@/hooks";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { EditTaskModal } from "../_components/edit-task-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const priorityColors = {
    LOW: "#10B981",    // Emerald
    MEDIUM: "#8B5CF6", // Violet
    HIGH: "#F59E0B",   // Amber
    URGENT: "#EF4444", // Red
};

const statusOptions = [
    { value: "TODO", label: "To Do", bgClass: "bg-zinc-100 dark:bg-zinc-800", textClass: "text-zinc-600 dark:text-zinc-400" },
    { value: "IN_PROGRESS", label: "In Progress", bgClass: "bg-amber-50 dark:bg-amber-900/10", textClass: "text-amber-600 dark:text-amber-400" },
    { value: "IN_REVIEW", label: "In Review", bgClass: "bg-indigo-50 dark:bg-indigo-900/10", textClass: "text-indigo-600 dark:text-indigo-400" },
    { value: "DONE", label: "Completed", bgClass: "bg-emerald-50 dark:bg-emerald-900/10", textClass: "text-emerald-600 dark:text-emerald-400" },
];

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const { task, isLoading, error, addComment, mutate } = useTask(resolvedParams.id);
    const { updateTask, deleteTask } = useTasks();

    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            await addComment(newComment);
            setNewComment("");
            toast.success("Comment added");
        } catch (err) {
            console.error("Failed to add comment:", err);
            toast.error("Failed to add comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!task) return;

        setIsUpdatingStatus(true);
        try {
            await updateTask(task.id, { status: newStatus as typeof task.status });
            mutate();
            toast.success(`Status updated to ${statusOptions.find(o => o.value === newStatus)?.label}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        setIsDeleting(true);
        try {
            await deleteTask(task.id);
            toast.success("Task deleted");
            router.push("/tasks");
        } catch (err) {
            console.error("Failed to delete task:", err);
            toast.error("Failed to delete task");
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading task...</p>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto border border-dashed border-border rounded-xl">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4 mx-auto text-muted-foreground">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-foreground mb-2">Task not found</h2>
                <p className="text-xs text-muted-foreground mb-6">
                    This task may have been deleted or moved.
                </p>
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tasks
                </Link>
            </div>
        );
    }

    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE";
    const formattedDueDate = dueDate?.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const canEdit = session?.user?.id === task.creatorId || session?.user?.id === task.assigneeId;
    const canDelete = session?.user?.id === task.creatorId || session?.user?.role === "ADMIN";

    return (
        <div className="min-h-screen pb-20 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pt-4">
                <div className="flex items-start gap-4">
                    <Link
                        href="/tasks"
                        className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-surface shadow-sm mt-1"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-zinc-50 dark:bg-zinc-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: task.project.color }} />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                    {task.project.name}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">/</span>
                            <span className="text-xs font-mono text-muted-foreground">TSK-{task.id.slice(0, 4).toUpperCase()}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
                            {task.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-border rounded-lg transition-all text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all text-xs font-semibold text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* Main Content */}
                <div className="flex-1 w-full space-y-6">
                    {/* Task Card */}
                    <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status:</span>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusOptions.find(o => o.value === task.status)?.bgClass} ${statusOptions.find(o => o.value === task.status)?.textClass}`}>
                                    <ActivityIcon status={task.status} className="w-3.5 h-3.5" />
                                    {statusOptions.find(o => o.value === task.status)?.label}
                                </div>
                            </div>

                            <div className="w-px h-4 bg-border" />

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Priority:</span>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                                    <span className="text-foreground">{task.priority.toLowerCase()}</span>
                                </div>
                            </div>

                            {dueDate && (
                                <>
                                    <div className="w-px h-4 bg-border" />
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${isOverdue
                                        ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/20 dark:text-rose-400'
                                        : 'bg-white dark:bg-zinc-900 border-border text-foreground'
                                        }`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formattedDueDate}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                Description
                            </h3>
                            {task.description ? (
                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {task.description}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No description provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                Discussion ({task.comments?.length || 0})
                            </h3>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6 mb-6">
                            {task.comments && task.comments.length > 0 ? (
                                task.comments.map((comment, i) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <div
                                            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            {comment.author.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-foreground">
                                                    {comment.author.name}
                                                </span>
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-sm text-foreground/90 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-border/50">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-border/50">
                                    <MessageSquare className="w-6 h-6 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs font-medium text-muted-foreground">No comments yet</p>
                                </div>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmittingComment || !newComment.trim()}
                                className="h-10 px-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-all font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingComment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Post"
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full xl:w-[320px] space-y-6">
                    {/* Status Update */}
                    <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                            Change Status
                        </h3>
                        <div className="space-y-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    disabled={isUpdatingStatus || task.status === option.value}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border
                                        ${task.status === option.value
                                            ? `${option.bgClass} ${option.textClass} border-transparent ring-1 ring-inset ring-current`
                                            : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground border-transparent hover:border-border'}
                                        disabled:opacity-80 disabled:cursor-not-allowed
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        <ActivityIcon status={option.value} className="w-3.5 h-3.5" />
                                        {option.label}
                                    </span>
                                    {task.status === option.value && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">
                            Details
                        </h3>

                        <div className="space-y-4">
                            {/* Created By */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">Reporter</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                        {task.creator?.name?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">
                                        {task.creator?.name || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Assigned To */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">Assignee</span>
                                <div className="flex items-center gap-2">
                                    {task.assignee ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                                {task.assignee.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-semibold text-foreground">
                                                {task.assignee.name}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs font-medium text-muted-foreground italic">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">Created</span>
                                <span className="text-xs font-medium text-foreground">
                                    {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">Updated</span>
                                <span className="text-xs font-medium text-foreground">
                                    {new Date(task.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {task && (
                <EditTaskModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    task={{
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        projectId: task.projectId,
                        assigneeId: task.assigneeId,
                        dueDate: task.dueDate,
                    }}
                    onSuccess={() => mutate()}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                description={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
                confirmText="Delete Task"
                variant="danger"
            />
        </div>
    );
}

function ActivityIcon({ status, className }: { status: string, className?: string }) {
    if (status === "DONE") return <CheckCircle2 className={className} />;
    if (status === "IN_PROGRESS") return <Loader2 className={className + " animate-spin"} />;
    if (status === "TODO") return <Circle className={className} />;
    return <Sparkles className={className} />;
}
