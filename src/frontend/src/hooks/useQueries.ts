import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "../backend.d";
import { useActor } from "./useActor";

export function useSaveCompanionPreference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preference: string) => {
      if (!actor) return;
      try {
        return await actor.saveCompanionPreference(preference);
      } catch {
        // silently fail - preference saved locally anyway
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companionPreference"] });
    },
  });
}

export function useGetCompanionPreference() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["companionPreference"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getCompanionPreference();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveChatHistory() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (history: Array<Message>) => {
      if (!actor) return;
      try {
        return await actor.saveChatHistory(history);
      } catch {
        // silently fail - chat still works in memory
      }
    },
  });
}

export function useGetChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<Message>>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getChatHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}
