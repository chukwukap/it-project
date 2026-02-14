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

  return json.success ? json.data : json;
};

export interface ProjectMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
    members: number;
  };
  members: ProjectMember[];
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    "/api/projects",
    fetcher
  );

  const createProject = useCallback(
    async (projectData: {
      name: string;
      description?: string;
      color?: string;
    }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to create project");
      }

      const newProject = json.success ? json.data : json;
      mutate(
        (projects) => (projects ? [newProject, ...projects] : [newProject]),
        false
      );
      return newProject;
    },
    [mutate]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to update project");
      }

      const updatedProject = json.success ? json.data : json;
      mutate(
        (projects) =>
          projects?.map((p) => (p.id === id ? updatedProject : p)) ?? [],
        false
      );
      return updatedProject;
    },
    [mutate]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || "Failed to delete project");
      }

      mutate((projects) => projects?.filter((p) => p.id !== id) ?? [], false);
    },
    [mutate]
  );

  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  return {
    project: data,
    isLoading,
    error,
    mutate,
  };
}
