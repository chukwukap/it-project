import { Badge, Avatar, Card, CardContent } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Link from "next/link";

interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    project?: { id: string; name: string; color: string } | null;
    assignee?: { id: string; name: string; avatar?: string | null } | null;
}

const statusMap: Record<string, "todo" | "in-progress" | "in-review" | "done"> = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    IN_REVIEW: "in-review",
    DONE: "done",
};

const priorityMap: Record<string, "low" | "medium" | "high" | "urgent"> = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
};

const statusLabels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
};

export function TaskCard({ task }: { task: Task }) {
    return (
        <Link href={`/tasks/${task.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{task.title}</h3>
                        <Badge variant={priorityMap[task.priority]}>{task.priority}</Badge>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.project && (
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: task.project.color }}
                                />
                                <span className="truncate max-w-[100px]">{task.project.name}</span>
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(task.dueDate)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <Badge variant={statusMap[task.status]}>
                            {statusLabels[task.status]}
                        </Badge>
                        {task.assignee && (
                            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
