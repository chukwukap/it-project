import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  successResponse,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/tasks/[id] - Get a single task by ID
// ============================================================================

export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      project: {
        select: { id: true, name: true, color: true, description: true },
      },
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Check access: must be admin, creator, assignee, or project member
  if (session.user.role !== "ADMIN") {
    const isCreator = task.creatorId === session.user.id;
    const isAssignee = task.assigneeId === session.user.id;

    if (!isCreator && !isAssignee) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: session.user.id,
          },
        },
      });

      if (!isMember) {
        throw new ForbiddenError("You don't have access to this task");
      }
    }
  }

  return successResponse(task);
});

// ============================================================================
// PUT /api/tasks/[id] - Update a task
// ============================================================================

export const PUT = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;
  const data = await parseBody(request, taskSchema.partial());

  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { creatorId: true, assigneeId: true, projectId: true },
  });

  if (!existingTask) {
    throw new NotFoundError("Task");
  }

  // Check permission: admin, creator, or assignee can update
  if (session.user.role !== "ADMIN") {
    const canUpdate =
      existingTask.creatorId === session.user.id ||
      existingTask.assigneeId === session.user.id;

    if (!canUpdate) {
      throw new ForbiddenError("You don't have permission to update this task");
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
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

  return successResponse(task);
});

// ============================================================================
// DELETE /api/tasks/[id] - Delete a task
// ============================================================================

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;

  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { creatorId: true, projectId: true },
  });

  if (!existingTask) {
    throw new NotFoundError("Task");
  }

  // Only admin or creator can delete
  if (
    session.user.role !== "ADMIN" &&
    existingTask.creatorId !== session.user.id
  ) {
    throw new ForbiddenError("You don't have permission to delete this task");
  }

  await prisma.task.delete({ where: { id } });

  return successResponse({ deleted: true });
});
