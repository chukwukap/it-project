import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  successResponse,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/tasks/[id]/comments - Get all comments for a task
// ============================================================================

export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const taskId = params.id;

  // Verify task exists and user has access
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, creatorId: true, assigneeId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Check access
  if (session.user.role !== "ADMIN") {
    const hasAccess =
      task.creatorId === session.user.id || task.assigneeId === session.user.id;

    if (!hasAccess) {
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

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return successResponse(comments);
});

// ============================================================================
// POST /api/tasks/[id]/comments - Add a comment to a task
// ============================================================================

export const POST = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const taskId = params.id;
  const data = await parseBody(request, commentSchema);

  // Verify task exists and user has access
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, creatorId: true, assigneeId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Check access
  if (session.user.role !== "ADMIN") {
    const hasAccess =
      task.creatorId === session.user.id || task.assigneeId === session.user.id;

    if (!hasAccess) {
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

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      taskId,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return successResponse(comment, 201);
});
