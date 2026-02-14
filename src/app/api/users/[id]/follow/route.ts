import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  successResponse,
  ApiError,
} from "@/lib/api-utils";

// POST /api/users/[id]/follow - Follow/Unfollow a user
export const POST = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const targetUserId = params.id;

  if (targetUserId === session.user.id) {
    throw new ApiError("INVALID_INPUT", "Cannot follow yourself", 400);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    return successResponse({ following: false });
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });
    return successResponse({ following: true });
  }
});

// GET /api/users/[id]/follow - Check if following a user
export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const targetUserId = params.id;

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  return successResponse({ following: !!follow });
});
