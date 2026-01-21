import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type { CreateCommentInput, UpdateCommentInput } from "@jotter/shared";

export function useComments(documentId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["comments", documentId],
    queryFn: async () => {
      const token = await getToken();
      return api.comments.list(documentId, token);
    },
    enabled: !!documentId,
  });
}

export function useCreateComment(documentId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentInput) => {
      const token = await getToken();
      return api.comments.create(documentId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", documentId] });
    },
  });
}

export function useUpdateComment(documentId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentInput;
    }) => {
      const token = await getToken();
      return api.comments.update(commentId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", documentId] });
    },
  });
}

export function useDeleteComment(documentId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const token = await getToken();
      return api.comments.delete(commentId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", documentId] });
    },
  });
}
