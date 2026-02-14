import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  parseSearchParams,
  getPaginationParams,
  successResponse,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/users - List all users (for assignee selection, mentor list, etc.)
// ============================================================================

export const GET = withErrorHandler(async (request) => {
  await requireAuth();
  const searchParams = parseSearchParams(request);
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by project membership if specified
  if (projectId) {
    where.projects = {
      some: { projectId },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
            projects: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Transform to include task/project counts
  const usersWithStats = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    taskCount: user._count.assignedTasks,
    projectCount: user._count.projects,
  }));

  return successResponse(usersWithStats, 200, {
    total,
    page,
    limit,
    hasMore: skip + users.length < total,
  });
});
