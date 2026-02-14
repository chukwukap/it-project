import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  successResponse,
} from "@/lib/api-utils";

// GET /api/conversations - List user's conversations
export const GET = withErrorHandler(async (request) => {
  const session = await requireAuth();

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Transform to include "other" participant and last message
  const transformed = conversations.map((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== session.user.id,
    );
    const lastMessage = conv.messages[0];
    const unreadCount = conv.messages.filter(
      (m) => m.senderId !== session.user.id,
    ).length;

    return {
      id: conv.id,
      participant: otherParticipant?.user || null,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isSender: lastMessage.senderId === session.user.id,
          }
        : null,
      unreadCount,
      updatedAt: conv.updatedAt,
    };
  });

  return successResponse(transformed);
});

// POST /api/conversations - Create or get existing conversation
export const POST = withErrorHandler(async (request) => {
  const session = await requireAuth();
  const body = await request.json();
  const { participantId } = body;

  if (!participantId) {
    throw new Error("Participant ID is required");
  }

  if (participantId === session.user.id) {
    throw new Error("Cannot create a conversation with yourself");
  }

  const includeParticipants = {
    participants: {
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    },
  };

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: includeParticipants,
  });

  if (existingConversation) {
    return successResponse(existingConversation);
  }

  // Create new conversation — handle race condition where another request
  // may have created the same conversation between our check and create
  try {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.user.id }, { userId: participantId }],
        },
      },
      include: includeParticipants,
    });

    return successResponse(conversation, 201);
  } catch (error: unknown) {
    // P2002 = unique constraint violation — the conversation was created
    // by a concurrent request between our findFirst and create calls
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const retryConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: participantId } } },
          ],
        },
        include: includeParticipants,
      });

      if (retryConversation) {
        return successResponse(retryConversation);
      }
    }
    throw error;
  }
});
