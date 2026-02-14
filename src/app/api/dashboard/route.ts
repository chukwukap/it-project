import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  successResponse,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/dashboard - Aggregated dashboard data
// ============================================================================

export const GET = withErrorHandler(async () => {
  const session = await requireAuth();
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  // Base filter for user's tasks
  const taskFilter = isAdmin ? {} : { assigneeId: userId };

  // Get task statistics
  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    upcomingDeadlines,
  ] = await Promise.all([
    prisma.task.count({ where: taskFilter }),
    prisma.task.count({ where: { ...taskFilter, status: "DONE" } }),
    prisma.task.count({ where: { ...taskFilter, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...taskFilter, status: "TODO" } }),
    prisma.task.count({
      where: {
        ...taskFilter,
        status: { not: "DONE" },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    }),
  ]);

  // Get recent tasks (in progress)
  const recentTasks = await prisma.task.findMany({
    where: {
      ...taskFilter,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      project: {
        select: { name: true, color: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  // Get upcoming tasks with deadlines
  const upcomingTasks = await prisma.task.findMany({
    where: {
      ...taskFilter,
      status: { not: "DONE" },
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      priority: true,
      project: {
        select: { name: true, color: true },
      },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  // Get activity data for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const completedTasksLast7Days = await prisma.task.findMany({
    where: {
      ...taskFilter,
      status: "DONE",
      updatedAt: { gte: sevenDaysAgo },
    },
    select: {
      updatedAt: true,
    },
  });

  // Group by day
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activityMap = new Map<string, number>();

  // Initialize all days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = dayNames[date.getDay()];
    activityMap.set(dayName, 0);
  }

  // Count completed tasks per day
  for (const task of completedTasksLast7Days) {
    const dayName = dayNames[task.updatedAt.getDay()];
    activityMap.set(dayName, (activityMap.get(dayName) || 0) + 1);
  }

  const activityData = Array.from(activityMap.entries()).map(
    ([day, completed]) => ({
      day,
      completed,
    })
  );

  // Get user's projects count
  const projectCount = await prisma.projectMember.count({
    where: { userId },
  });

  return successResponse({
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      upcomingDeadlines,
      projectCount,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    recentTasks,
    upcomingTasks,
    activityData,
  });
});
