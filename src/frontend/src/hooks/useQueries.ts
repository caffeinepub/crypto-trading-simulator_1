import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "../backend.d";
import { useActor } from "./useActor";

export function useSaveCompanionPreference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preference: string) => {
      if (!actor) return;
      return actor.saveCompanionPreference(preference);
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
      return actor.getCompanionPreference();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveChatHistory() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (history: Array<Message>) => {
      if (!actor) return;
      return actor.saveChatHistory(history);
    },
  });
}

export function useGetChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<Message>>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
  });
}
