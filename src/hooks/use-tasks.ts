import useSWR from "swr";
import { useCallback } from "react";

// Fetcher that extracts data from API response
const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.error?.message || "An error occurred");
    throw error;
  }

  // Handle both wrapped and unwrapped responses
  return json.success ? json.data : json;
};

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    color: string;
  };
  creator?: {
    id: string;
    name: string;
  };
  _count?: {
    comments: number;
  };
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
}

interface UseTasksOptions {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.priority) params.append("priority", options.priority);
  if (options.projectId) params.append("projectId", options.projectId);
  if (options.search) params.append("search", options.search);

  const queryString = params.toString();
  const url = `/api/tasks${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<Task[]>(url, fetcher);

  const createTask = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      status: Task["status"];
      priority: Task["priority"];
      dueDate?: string | null;
      projectId: string;
      assigneeId?: string | null;
    }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to create task");
      }

      const newTask = json.success ? json.data : json;
      mutate((tasks) => (tasks ? [newTask, ...tasks] : [newTask]), false);
      return newTask;
    },
    [mutate]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to update task");
      }

      const updatedTask = json.success ? json.data : json;
      mutate(
        (tasks) => tasks?.map((t) => (t.id === id ? updatedTask : t)) ?? [],
        false
      );
      return updatedTask;
    },
    [mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to delete task");
      }

      mutate((tasks) => tasks?.filter((t) => t.id !== id) ?? [], false);
    },
    [mutate]
  );

  return {
    tasks: data ?? [],
    isLoading,
    error,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useTask(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Task>(
    id ? `/api/tasks/${id}` : null,
    fetcher
  );

  const addComment = useCallback(
    async (content: string) => {
      const response = await fetch(`/api/tasks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to add comment");
      }

      // Revalidate to get updated comments
      mutate();
      return json.success ? json.data : json;
    },
    [id, mutate]
  );

  return {
    task: data,
    isLoading,
    error,
    mutate,
    addComment,
  };
}
