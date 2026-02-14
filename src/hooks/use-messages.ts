import useSWR from "swr";
import { useCallback } from "react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "An error occurred");
  return json.success ? json.data : json;
};

// Hook to check and toggle follow status
export function useFollow(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/users/${userId}/follow` : null,
    fetcher
  );

  const toggleFollow = useCallback(async () => {
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok)
      throw new Error(json.error?.message || "Failed to toggle follow");
    mutate(json.success ? json.data : json, false);
    return json.success ? json.data : json;
  }, [userId, mutate]);

  return {
    isFollowing: data?.following ?? false,
    isLoading,
    error,
    toggleFollow,
  };
}

// Hook to get user's conversations
export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/conversations",
    fetcher
  );

  const createConversation = useCallback(
    async (participantId: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed to create conversation");
      mutate();
      return json.success ? json.data : json;
    },
    [mutate]
  );

  return {
    conversations: data ?? [],
    isLoading,
    error,
    mutate,
    createConversation,
  };
}

// Hook to get messages for a conversation
export function useMessages(conversationId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? `/api/conversations/${conversationId}/messages` : null,
    fetcher,
    { refreshInterval: 3000 } // Poll every 3 seconds for new messages
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return null;

      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed to send message");
      mutate();
      return json.success ? json.data : json;
    },
    [conversationId, mutate]
  );

  return {
    messages: data ?? [],
    isLoading,
    error,
    mutate,
    sendMessage,
  };
}
