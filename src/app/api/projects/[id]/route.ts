import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  successResponse,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/projects/[id] - Get a single project with full details
// ============================================================================

export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tasks: true, members: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  // Check access: must be admin or project member
  if (session.user.role !== "ADMIN") {
    const isMember = project.members.some((m) => m.user.id === session.user.id);
    if (!isMember) {
      throw new ForbiddenError("You don't have access to this project");
    }
  }

  return successResponse(project);
});

// ============================================================================
// PUT /api/projects/[id] - Update a project
// ============================================================================

export const PUT = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;
  const data = await parseBody(request, projectSchema.partial());

  // Check if user is admin or project owner/admin
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId: session.user.id,
      },
    },
  });

  if (session.user.role !== "ADMIN") {
    if (!membership || membership.role === "MEMBER") {
      throw new ForbiddenError(
        "Only project owners or admins can update the project"
      );
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color && { color: data.color }),
    },
    include: {
      _count: {
        select: { tasks: true, members: true },
      },
    },
  });

  return successResponse(project);
});

// ============================================================================
// DELETE /api/projects/[id] - Delete a project
// ============================================================================

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const id = params.id;

  // Only admin or project owner can delete
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId: session.user.id,
      },
    },
  });

  if (session.user.role !== "ADMIN") {
    if (!membership || membership.role !== "OWNER") {
      throw new ForbiddenError("Only the project owner can delete the project");
    }
  }

  await prisma.project.delete({ where: { id } });

  return successResponse({ deleted: true });
});
