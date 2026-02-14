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

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  upcomingDeadlines: number;
  projectCount: number;
  completionRate: number;
}

export interface RecentTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: {
    name: string;
    color: string;
  };
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  project: {
    name: string;
    color: string;
  };
}

export interface ActivityData {
  day: string;
  completed: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: RecentTask[];
  upcomingTasks: UpcomingTask[];
  activityData: ActivityData[];
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher
  );

  return {
    data,
    stats: data?.stats,
    recentTasks: data?.recentTasks ?? [],
    upcomingTasks: data?.upcomingTasks ?? [],
    activityData: data?.activityData ?? [],
    isLoading,
    error,
    mutate,
  };
}
