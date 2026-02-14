import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  parseBody,
  successResponse,
} from "@/lib/api-utils";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().nullable().optional(),
});

// ============================================================================
// GET /api/users/me - Get current user profile
// ============================================================================

export const GET = withErrorHandler(async () => {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
          createdTasks: true,
          projects: true,
          comments: true,
        },
      },
    },
  });

  return successResponse({
    ...user,
    stats: user?._count,
  });
});

// ============================================================================
// PUT /api/users/me - Update current user profile
// ============================================================================

export const PUT = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const data = await parseBody(request, updateProfileSchema);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  return successResponse(user);
});
