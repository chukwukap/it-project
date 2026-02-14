import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  successResponse,
  ForbiddenError,
  ApiError,
} from "@/lib/api-utils";
import { NextResponse } from "next/server";

// GET /api/projects/[id]/members - List project members
export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const projectId = params.id;

  // Check if user is a member of the project
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    throw new ForbiddenError("Not a project member");
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return successResponse(
    members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }))
  );
});

// POST /api/projects/[id]/members - Add member to project
export const POST = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const projectId = params.id;
  const body = await request.json();
  const { userId, role = "MEMBER" } = body;

  if (!userId) {
    throw new ApiError("INVALID_INPUT", "User ID is required", 400);
  }

  // Check if requester has permission (OWNER or ADMIN)
  const requesterMembership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });

  if (!requesterMembership) {
    throw new ForbiddenError("Only owners and admins can add members");
  }

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });

  if (existingMember) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "CONFLICT", message: "User is already a member" },
      },
      { status: 409 }
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });

  return successResponse(
    {
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    },
    201
  );
});

// DELETE /api/projects/[id]/members - Remove member from project
export const DELETE = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const projectId = params.id;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    throw new ApiError("INVALID_INPUT", "Member ID is required", 400);
  }

  // Check if requester has permission (OWNER or ADMIN)
  const requesterMembership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });

  if (!requesterMembership) {
    throw new ForbiddenError("Only owners and admins can remove members");
  }

  // Prevent removing the last owner
  const memberToRemove = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });

  if (memberToRemove?.role === "OWNER") {
    const ownerCount = await prisma.projectMember.count({
      where: { projectId, role: "OWNER" },
    });

    if (ownerCount <= 1) {
      throw new ForbiddenError("Cannot remove the last owner");
    }
  }

  await prisma.projectMember.delete({
    where: { id: memberId },
  });

  return successResponse({ deleted: true });
});
