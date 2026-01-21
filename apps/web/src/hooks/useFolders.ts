import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import type { CreateFolderInput, UpdateFolderInput } from "@jotter/shared";

export function useFolders() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const token = await getToken();
      return api.folders.list(token);
    },
  });
}

export function useFolder(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["folders", id],
    queryFn: async () => {
      const token = await getToken();
      return api.folders.get(id, token);
    },
    enabled: !!id,
  });
}

export function useCreateFolder() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFolderInput) => {
      const token = await getToken();
      return api.folders.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useUpdateFolder() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFolderInput }) => {
      const token = await getToken();
      return api.folders.update(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDeleteFolder() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.folders.delete(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
