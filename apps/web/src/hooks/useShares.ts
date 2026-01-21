import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type { CreateShareInput } from "@jotter/shared";

export function useShares(documentId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["shares", documentId],
    queryFn: async () => {
      const token = await getToken();
      return api.shares.list(documentId, token);
    },
    enabled: !!documentId,
  });
}

export function useCreateShare(documentId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShareInput) => {
      const token = await getToken();
      return api.shares.create(documentId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", documentId] });
    },
  });
}

export function useRevokeShare(documentId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      const token = await getToken();
      return api.shares.revoke(shareId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", documentId] });
    },
  });
}

// Hooks for public shared document access
export function useSharedDocument(shareToken: string) {
  return useQuery({
    queryKey: ["shared", shareToken],
    queryFn: () => api.shares.getShared(shareToken),
    enabled: !!shareToken,
  });
}

export function useSharedComments(shareToken: string) {
  return useQuery({
    queryKey: ["shared", shareToken, "comments"],
    queryFn: () => api.shares.getSharedComments(shareToken),
    enabled: !!shareToken,
  });
}

export function useCreateSharedComment(shareToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      authorName: string;
      authorEmail?: string;
      content: string;
      selectionStart: number;
      selectionEnd: number;
      selectionText: string;
    }) => api.shares.createSharedComment(shareToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared", shareToken, "comments"] });
    },
  });
}
