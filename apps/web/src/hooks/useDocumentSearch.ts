import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Document } from "@jotter/shared";

export function useDocumentSearch(query: string) {
  return useQuery({
    queryKey: ["documents", "search", query],
    queryFn: () =>
      api.get<{ documents: Document[] }>(`/documents/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 1,
    staleTime: 1000 * 30,
  });
}
