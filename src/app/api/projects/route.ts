import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  parseSearchParams,
  getPaginationParams,
  successResponse,
} from "@/lib/api-utils";

// ============================================================================
// GET /api/projects - List all projects for the current user
// ============================================================================

export const GET = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const searchParams = parseSearchParams(request);
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search");

  // Build filter: user must be a member or admin
  const where: Record<string, unknown> = {};

  if (session.user.role !== "ADMIN") {
    where.members = {
      some: { userId: session.user.id },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          take: 5,
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return successResponse(projects, 200, {
    total,
    page,
    limit,
    hasMore: skip + projects.length < total,
  });
});

// ============================================================================
// POST /api/projects - Create a new project
// ============================================================================

export const POST = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const data = await parseBody(request, projectSchema);

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color || "#6366f1",
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      _count: {
        select: { tasks: true, members: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  return successResponse(project, 201);
});
