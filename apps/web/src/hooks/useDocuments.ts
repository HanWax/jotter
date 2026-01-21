import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "@jotter/shared";

export function useDocuments() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const token = await getToken();
      return api.documents.list(token);
    },
  });
}

export function useDocument(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const token = await getToken();
      return api.documents.get(id, token);
    },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentInput) => {
      const token = await getToken();
      return api.documents.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDocumentInput }) => {
      const token = await getToken();
      return api.documents.update(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", id] });
    },
  });
}

export function useDeleteDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.documents.delete(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function usePublishDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.documents.publish(id, token);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", id] });
    },
  });
}
