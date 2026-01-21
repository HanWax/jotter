import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.unknown().optional(),
  folderId: z.string().uuid().nullable().optional(),
  parentDocumentId: z.string().uuid().nullable().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.unknown().optional(),
  folderId: z.string().uuid().nullable().optional(),
  parentDocumentId: z.string().uuid().nullable().optional(),
  isPinned: z.boolean().optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export const createShareSchema = z.object({
  email: z.string().email(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export const createCommentSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().nullable().optional(),
  content: z.string().min(1).max(10000),
  selectionStart: z.number().int().min(0),
  selectionEnd: z.number().int().min(0),
  selectionText: z.string().max(1000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  resolved: z.boolean().optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const requestUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[\w-]+\/[\w.+-]+$/),
  sizeBytes: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
});

export const createAssetSchema = z.object({
  filename: z.string().min(1).max(255),
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[\w-]+\/[\w.+-]+$/),
  sizeBytes: z.number().int().min(1),
  r2Key: z.string().min(1),
});

export const documentAssetParamsSchema = z.object({
  documentId: z.string().uuid(),
  assetId: z.string().uuid(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const documentTagParamsSchema = z.object({
  documentId: z.string().uuid(),
  tagId: z.string().uuid(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreateShareInput = z.infer<typeof createShareSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
