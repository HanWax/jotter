import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Document } from "@jotter/shared";

export function usePinnedDocuments() {
  return useQuery({
    queryKey: ["documents", { pinned: true }],
    queryFn: () =>
      api.get<{ documents: Document[] }>("/documents?pinned=true"),
  });
}

export function useRecentDocuments(limit = 20) {
  return useQuery({
    queryKey: ["documents", { sort: "updatedAt", limit }],
    queryFn: () =>
      api.get<{ documents: Document[] }>(`/documents?sort=updatedAt&order=desc&limit=${limit}`),
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      api.patch<{ document: Document }>(`/documents/${id}`, { isPinned }),
    onMutate: async ({ id, isPinned }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["documents"] });

      // Optimistically update
      queryClient.setQueriesData<{ documents: Document[] }>(
        { queryKey: ["documents"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            documents: old.documents.map((doc) =>
              doc.id === id ? { ...doc, isPinned } : doc
            ),
          };
        }
      );
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
