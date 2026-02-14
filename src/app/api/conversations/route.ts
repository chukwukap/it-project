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
      (p) => p.userId !== session.user.id
    );
    const lastMessage = conv.messages[0];
    const unreadCount = conv.messages.filter(
      (m) => m.senderId !== session.user.id
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

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  if (existingConversation) {
    return successResponse(existingConversation);
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.user.id }, { userId: participantId }],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  return successResponse(conversation, 201);
});
