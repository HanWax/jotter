export type User = {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Folder = {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentStatus = "draft" | "published";

export type Document = {
  id: string;
  userId: string;
  folderId: string | null;
  parentDocumentId: string | null;
  title: string;
  content: unknown;
  status: DocumentStatus;
  isPinned: boolean;
  pinOrder: number | null;
  publishedContent: unknown | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  content: unknown;
  title: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  createdByName: string | null;
};

export type Tag = {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: Date;
};

export type Asset = {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  r2Key: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Share = {
  id: string;
  documentId: string;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date | null;
  revoked: boolean;
};

export type Comment = {
  id: string;
  documentId: string;
  shareId: string | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  selectionStart: number;
  selectionEnd: number;
  selectionText: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
};
