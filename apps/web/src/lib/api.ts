const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Documents
  documents: {
    list: (token: string | null) =>
      request<{ documents: Document[] }>("/api/documents", { token }),
    get: (id: string, token: string | null) =>
      request<{ document: Document }>(`/api/documents/${id}`, { token }),
    create: (data: CreateDocumentInput, token: string | null) =>
      request<{ document: Document }>("/api/documents", {
        method: "POST",
        body: data,
        token,
      }),
    update: (id: string, data: UpdateDocumentInput, token: string | null) =>
      request<{ document: Document }>(`/api/documents/${id}`, {
        method: "PATCH",
        body: data,
        token,
      }),
    delete: (id: string, token: string | null) =>
      request<{ success: boolean }>(`/api/documents/${id}`, {
        method: "DELETE",
        token,
      }),
    publish: (id: string, token: string | null) =>
      request<{ document: Document }>(`/api/documents/${id}/publish`, {
        method: "POST",
        token,
      }),
    unpublish: (id: string, token: string | null) =>
      request<{ document: Document }>(`/api/documents/${id}/unpublish`, {
        method: "POST",
        token,
      }),
  },

  // Folders
  folders: {
    list: (token: string | null) =>
      request<{ folders: Folder[] }>("/api/folders", { token }),
    get: (id: string, token: string | null) =>
      request<{ folder: Folder }>(`/api/folders/${id}`, { token }),
    create: (data: CreateFolderInput, token: string | null) =>
      request<{ folder: Folder }>("/api/folders", {
        method: "POST",
        body: data,
        token,
      }),
    update: (id: string, data: UpdateFolderInput, token: string | null) =>
      request<{ folder: Folder }>(`/api/folders/${id}`, {
        method: "PATCH",
        body: data,
        token,
      }),
    delete: (id: string, token: string | null) =>
      request<{ success: boolean }>(`/api/folders/${id}`, {
        method: "DELETE",
        token,
      }),
  },

  // Tags
  tags: {
    list: (token: string | null) =>
      request<{ tags: Tag[] }>("/api/tags", { token }),
    create: (data: CreateTagInput, token: string | null) =>
      request<{ tag: Tag }>("/api/tags", {
        method: "POST",
        body: data,
        token,
      }),
    update: (id: string, data: UpdateTagInput, token: string | null) =>
      request<{ tag: Tag }>(`/api/tags/${id}`, {
        method: "PATCH",
        body: data,
        token,
      }),
    delete: (id: string, token: string | null) =>
      request<{ success: boolean }>(`/api/tags/${id}`, {
        method: "DELETE",
        token,
      }),
    addToDocument: (documentId: string, tagId: string, token: string | null) =>
      request<{ success: boolean }>(
        `/api/tags/documents/${documentId}/tags/${tagId}`,
        { method: "POST", token }
      ),
    removeFromDocument: (documentId: string, tagId: string, token: string | null) =>
      request<{ success: boolean }>(
        `/api/tags/documents/${documentId}/tags/${tagId}`,
        { method: "DELETE", token }
      ),
  },
};

// Re-export types for convenience
import type {
  Document,
  Folder,
  Tag,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFolderInput,
  UpdateFolderInput,
  CreateTagInput,
  UpdateTagInput,
} from "@jotter/shared";

export type { ApiError };
