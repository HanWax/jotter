const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  isFile?: boolean;
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

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token, headers: customHeaders, isFile } = options;

  const headers: Record<string, string> = {
    ...customHeaders,
  };

  if (!isFile) {
    headers["Content-Type"] = "application/json";
  }

  const effectiveToken = token ?? authToken;
  if (effectiveToken) {
    headers["Authorization"] = `Bearer ${effectiveToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFile ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Generic methods for hooks
  get: <T>(endpoint: string) =>
    request<T>(`/api${endpoint}`),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(`/api${endpoint}`, { method: "POST", body }),
  put: <T>(endpoint: string, body: unknown, options?: { headers?: Record<string, string> }) =>
    request<T>(`/api${endpoint}`, {
      method: "PUT",
      body,
      isFile: body instanceof File || body instanceof Blob || body instanceof ArrayBuffer,
      headers: options?.headers,
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(`/api${endpoint}`, { method: "PATCH", body }),
  delete: <T>(endpoint: string) =>
    request<T>(`/api${endpoint}`, { method: "DELETE" }),

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
    getVersions: (id: string, token: string | null) =>
      request<{ versions: DocumentVersion[] }>(`/api/documents/${id}/versions`, {
        token,
      }),
    restoreVersion: (
      documentId: string,
      versionId: string,
      token: string | null
    ) =>
      request<{ document: Document }>(
        `/api/documents/${documentId}/versions/${versionId}/restore`,
        { method: "POST", token }
      ),
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
  DocumentVersion,
  Folder,
  Tag,
  Asset,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFolderInput,
  UpdateFolderInput,
  CreateTagInput,
  UpdateTagInput,
} from "@jotter/shared";

export type { ApiError };
export type { Asset };
