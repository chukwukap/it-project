import useSWR from "swr";

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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  taskCount?: number;
  projectCount?: number;
}

export interface CurrentUser extends User {
  stats?: {
    assignedTasks: number;
    createdTasks: number;
    projects: number;
    comments: number;
  };
}

export function useUsers(
  options: { search?: string; projectId?: string } = {}
) {
  const params = new URLSearchParams();
  if (options.search) params.append("search", options.search);
  if (options.projectId) params.append("projectId", options.projectId);

  const queryString = params.toString();
  const url = `/api/users${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<User[]>(url, fetcher);

  return {
    users: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<CurrentUser>(
    "/api/users/me",
    fetcher
  );

  const updateProfile = async (updates: {
    name?: string;
    avatar?: string | null;
  }) => {
    const response = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message || "Failed to update profile");
    }

    const updatedUser = json.success ? json.data : json;
    mutate(updatedUser, false);
    return updatedUser;
  };

  return {
    user: data,
    isLoading,
    error,
    mutate,
    updateProfile,
  };
}
