"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit3,
    Users,
    ListTodo,
    Plus,
    Loader2,
    Trash2,
    FolderKanban,
    Clock,
    CheckCircle2,
    Circle,
    Crown,
    Shield,
    User as UserIcon,
} from "lucide-react";
import { useProjects, useTasks, useUsers } from "@/hooks";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditProjectModal } from "../_components/edit-project-modal";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const priorityColors: Record<string, string> = {
    LOW: "#10B981",
    MEDIUM: "#8B5CF6",
    HIGH: "#F59E0B",
    URGENT: "#EF4444",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    TODO: Circle,
    IN_PROGRESS: Loader2,
    IN_REVIEW: Clock,
    DONE: CheckCircle2,
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    OWNER: Crown,
    ADMIN: Shield,
    MEMBER: UserIcon,
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const { projects, deleteProject, updateProject, mutate: mutateProjects } = useProjects();
    const { tasks } = useTasks({ projectId: resolvedParams.id });
    const { users } = useUsers();

    // Fetch project members
    const { data: membersData, mutate: mutateMembers } = useSWR(
        `/api/projects/${resolvedParams.id}/members`,
        fetcher
    );

    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const project = projects.find((p) => p.id === resolvedParams.id);
    const members = membersData?.data || [];
    const projectTasks = tasks || [];

    // Find current user's membership
    const currentMembership = members.find(
        (m: { user: { id: string } }) => m.user.id === session?.user?.id
    );
    const canManageMembers = currentMembership?.role === "OWNER" || currentMembership?.role === "ADMIN";
    const isOwner = currentMembership?.role === "OWNER";

    // Filter out users who are already members
    const availableUsers = users.filter(
        (user) => !members.some((m: { user: { id: string } }) => m.user.id === user.id)
    );

    const handleAddMember = async () => {
        if (!selectedUserId) return;

        setIsAddingMember(true);
        try {
            const res = await fetch(`/api/projects/${resolvedParams.id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedUserId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || "Failed to add member");
            }

            toast.success("Member added successfully");
            mutateMembers();
            setSelectedUserId("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add member");
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        try {
            const res = await fetch(
                `/api/projects/${resolvedParams.id}/members?memberId=${memberId}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || "Failed to remove member");
            }

            toast.success(`${memberName} removed from project`);
            mutateMembers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove member");
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await deleteProject(resolvedParams.id);
            toast.success("Project deleted successfully");
            router.push("/projects");
        } catch (error) {
            toast.error("Failed to delete project");
            setIsDeleting(false);
        }
    };

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                    <FolderKanban className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-base font-bold text-foreground mb-2">Project not found</h2>
                <Link href="/projects" className="text-sm text-brand-500 hover:underline">
                    Back to Projects
                </Link>
            </div>
        );
    }

    const taskStats = {
        total: projectTasks.length,
        completed: projectTasks.filter((t) => t.status === "DONE").length,
        inProgress: projectTasks.filter((t) => t.status === "IN_PROGRESS").length,
    };

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pt-4">
                <div className="flex items-start gap-4">
                    <Link
                        href="/projects"
                        className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-surface shadow-sm mt-1"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: project.color }}
                        >
                            <FolderKanban className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canManageMembers && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-all text-xs font-semibold text-muted-foreground hover:text-brand-600"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    )}
                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all text-xs font-semibold text-muted-foreground hover:text-rose-600"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface rounded-lg border border-border p-4">
                            <div className="text-2xl font-bold text-foreground">{taskStats.total}</div>
                            <div className="text-xs text-muted-foreground font-medium">Total Tasks</div>
                        </div>
                        <div className="bg-surface rounded-lg border border-border p-4">
                            <div className="text-2xl font-bold text-emerald-600">{taskStats.completed}</div>
                            <div className="text-xs text-muted-foreground font-medium">Completed</div>
                        </div>
                        <div className="bg-surface rounded-lg border border-border p-4">
                            <div className="text-2xl font-bold text-amber-600">{taskStats.inProgress}</div>
                            <div className="text-xs text-muted-foreground font-medium">In Progress</div>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="bg-surface rounded-lg border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-muted-foreground" />
                                Tasks ({projectTasks.length})
                            </h3>
                            <Link
                                href={`/tasks?project=${resolvedParams.id}`}
                                className="text-xs font-medium text-brand-500 hover:underline"
                            >
                                View All
                            </Link>
                        </div>

                        {projectTasks.length > 0 ? (
                            <div className="space-y-2">
                                {projectTasks.slice(0, 8).map((task) => {
                                    const StatusIcon = statusIcons[task.status] || Circle;
                                    return (
                                        <Link
                                            key={task.id}
                                            href={`/tasks/${task.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                                        >
                                            <StatusIcon
                                                className={`w-4 h-4 ${task.status === "DONE"
                                                    ? "text-emerald-500"
                                                    : task.status === "IN_PROGRESS"
                                                        ? "text-amber-500 animate-spin"
                                                        : "text-muted-foreground"
                                                    }`}
                                            />
                                            <span className="text-sm font-medium text-foreground flex-1 truncate group-hover:text-brand-500 transition-colors">
                                                {task.title}
                                            </span>
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: priorityColors[task.priority] }}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No tasks yet.{" "}
                                <Link href="/tasks" className="text-brand-500 hover:underline">
                                    Create one
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Members */}
                <div className="space-y-6">
                    <div className="bg-surface rounded-lg border border-border p-5">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Members ({members.length})
                        </h3>

                        {/* Add Member */}
                        {canManageMembers && availableUsers.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="flex-1 h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-xs focus:border-brand-500 outline-none"
                                >
                                    <option value="">Add member...</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddMember}
                                    disabled={!selectedUserId || isAddingMember}
                                    className="h-9 px-3 bg-foreground text-background rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {isAddingMember ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                </button>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="space-y-2">
                            {members.map((member: { id: string; role: string; user: { id: string; name: string; email: string } }) => {
                                const RoleIcon = roleIcons[member.role] || UserIcon;
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted-foreground border border-zinc-300 dark:border-zinc-700">
                                            {member.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground truncate">
                                                {member.user.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <RoleIcon className="w-3 h-3" />
                                                {member.role.toLowerCase()}
                                            </div>
                                        </div>
                                        {canManageMembers && member.role !== "OWNER" && member.user.id !== session?.user?.id && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.user.name)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                description={`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project. This action cannot be undone.`}
                confirmText="Delete Project"
                variant="danger"
            />

            {/* Edit Project Modal */}
            <EditProjectModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                project={project}
                onUpdate={updateProject}
            />
        </div>
    );
}
