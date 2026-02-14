import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  successResponse,
  ForbiddenError,
  NotFoundError,
} from "@/lib/api-utils";

// GET /api/conversations/[id]/messages - Get messages for a conversation
export const GET = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const conversationId = params.id;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: session.user.id,
    },
  });

  if (!participant) {
    throw new ForbiddenError("Not a participant of this conversation");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Update last read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return successResponse(
    messages.map((m) => ({
      id: m.id,
      content: m.content,
      sender: m.sender,
      isSender: m.senderId === session.user.id,
      createdAt: m.createdAt,
    }))
  );
});

// POST /api/conversations/[id]/messages - Send a message
export const POST = withErrorHandler(async (request, context) => {
  const session = await requireAuth();
  const params = await context.params;
  const conversationId = params.id;
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    throw new Error("Message content is required");
  }

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: session.user.id,
    },
  });

  if (!participant) {
    throw new ForbiddenError("Not a participant of this conversation");
  }

  // Create message and update conversation
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      senderId: session.user.id,
    },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return successResponse(
    {
      id: message.id,
      content: message.content,
      sender: message.sender,
      isSender: true,
      createdAt: message.createdAt,
    },
    201
  );
});
