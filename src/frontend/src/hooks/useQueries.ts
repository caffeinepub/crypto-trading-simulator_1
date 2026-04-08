/**
 * React Query hooks for backend data.
 * The current backend.d.ts exposes no methods yet — all hooks gracefully
 * fall back to no-ops so the app runs without a connected canister.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Stub types matching the storage shape we would use if the backend is extended
export type StoredPreference = string;
export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

export function useSaveCompanionPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_preference: StoredPreference) => {
      // Backend method not yet exposed — preference is persisted in localStorage
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companionPreference"] });
    },
  });
}

export function useGetCompanionPreference() {
  return useQuery<StoredPreference | null>({
    queryKey: ["companionPreference"],
    queryFn: async () => {
      // No backend method available; read from localStorage in the component
      return null;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSaveChatHistory() {
  return useMutation({
    mutationFn: async (_history: StoredMessage[]) => {
      // Backend method not yet exposed — history lives in component state
      return;
    },
  });
}

export function useGetChatHistory() {
  return useQuery<StoredMessage[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      return [];
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}
