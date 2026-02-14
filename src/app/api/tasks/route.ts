import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  parseSearchParams,
  getPaginationParams,
  successResponse,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/tasks - List all tasks with filtering and pagination
// ============================================================================

export const GET = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const searchParams = parseSearchParams(request);
  const { page, limit, skip } = getPaginationParams(searchParams);

  // Build filter conditions
  const where: Record<string, unknown> = {};

  // Role-based access: non-admins see only their assigned tasks
  if (session.user.role !== "ADMIN") {
    where.assigneeId = session.user.id;
  }

  // Optional filters
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const projectId = searchParams.get("projectId");
  const search = searchParams.get("search");

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Execute queries in parallel
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return successResponse(tasks, 200, {
    total,
    page,
    limit,
    hasMore: skip + tasks.length < total,
  });
});

// ============================================================================
// POST /api/tasks - Create a new task
// ============================================================================

export const POST = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const data = await parseBody(request, taskSchema);

  // Verify user has access to the project
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: data.projectId,
        userId: session.user.id,
      },
    },
  });

  if (!projectMember && session.user.role !== "ADMIN") {
    throw new Error("You don't have access to this project");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      creatorId: session.user.id,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatar: true },
      },
      project: {
        select: { id: true, name: true, color: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  return successResponse(task, 201);
});
