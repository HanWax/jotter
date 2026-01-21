import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Asset } from "@jotter/shared";

type AssetsResponse = {
  assets: Asset[];
};

type AssetResponse = {
  asset: Asset;
};

type UploadUrlResponse = {
  uploadUrl: string;
  r2Key: string;
  method: string;
  headers: Record<string, string>;
};

type UploadResult = {
  success: boolean;
  r2Key: string;
  url: string;
  sizeBytes: number;
};

export function useAssets(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["assets", { limit, offset }],
    queryFn: () =>
      api.get<AssetsResponse>(`/assets?limit=${limit}&offset=${offset}`),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => api.get<AssetResponse>(`/assets/${id}`),
    enabled: !!id,
  });
}

export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Request upload URL
      const uploadInfo = await api.post<UploadUrlResponse>("/assets/upload", {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      // Step 2: Upload the file
      const uploadResult = await api.put<UploadResult>(
        uploadInfo.uploadUrl.replace("/api", ""),
        file,
        {
          headers: uploadInfo.headers,
        }
      );

      // Step 3: Create asset record
      const assetResponse = await api.post<AssetResponse>("/assets", {
        filename: file.name.replace(/[^a-zA-Z0-9.-]/g, "_"),
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: uploadResult.sizeBytes,
        r2Key: uploadResult.r2Key,
      });

      return assetResponse.asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useLinkAssetToDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      assetId,
    }: {
      documentId: string;
      assetId: string;
    }) => api.post(`/assets/documents/${documentId}/assets/${assetId}`, {}),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", documentId] });
    },
  });
}

export function useUnlinkAssetFromDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      assetId,
    }: {
      documentId: string;
      assetId: string;
    }) => api.delete(`/assets/documents/${documentId}/assets/${assetId}`),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ["documents", documentId] });
    },
  });
}
