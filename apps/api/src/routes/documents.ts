import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, asc, max, ilike, or, sql, inArray } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { documents, documentVersions } from "../db/schema.ts";
import {
  createDocumentSchema,
  updateDocumentSchema,
  idParamSchema,
  documentSearchSchema,
  documentListQuerySchema,
  bulkDocumentIdsSchema,
} from "@jotter/shared";
import { z } from "zod";

const versionIdParamSchema = z.object({
  id: z.string().uuid(),
  versionId: z.string().uuid(),
});
import type { AuthVariables } from "../middleware/auth.ts";

type DocumentsEnv = {
  Bindings: Env & { CLERK_SECRET_KEY: string };
  Variables: AuthVariables;
};

export const documentsRouter = new Hono<DocumentsEnv>();

// List documents with optional filtering
documentsRouter.get(
  "/",
  zValidator("query", documentListQuerySchema),
  async (c) => {
    const userId = c.get("userId");
    const { pinned, sort = "updatedAt", order = "desc", limit } = c.req.valid("query");
    const db = createDb(c.env);

    // Build conditions
    const conditions = [eq(documents.userId, userId)];
    if (pinned === "true") {
      conditions.push(eq(documents.isPinned, true));
    } else if (pinned === "false") {
      conditions.push(eq(documents.isPinned, false));
    }

    // Build order by
    const sortColumn =
      sort === "title"
        ? documents.title
        : sort === "createdAt"
          ? documents.createdAt
          : documents.updatedAt;
    const orderFn = order === "asc" ? asc : desc;

    let query = db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(orderFn(sortColumn));

    if (limit) {
      query = query.limit(limit) as typeof query;
    }

    const userDocs = await query;
    return c.json({ documents: userDocs });
  }
);

// Search documents (full-text: searches both title and content)
documentsRouter.get(
  "/search",
  zValidator("query", documentSearchSchema),
  async (c) => {
    const userId = c.get("userId");
    const { q } = c.req.valid("query");
    const db = createDb(c.env);

    // Search both title and content (JSONB cast to text)
    const searchPattern = `%${q}%`;
    const results = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          or(
            ilike(documents.title, searchPattern),
            sql`${documents.content}::text ILIKE ${searchPattern}`
          )
        )
      )
      .orderBy(desc(documents.updatedAt))
      .limit(20);

    return c.json({ documents: results });
  }
);

// Get single document
documentsRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json({ document: doc });
  }
);

// Create document
documentsRouter.post(
  "/",
  zValidator("json", createDocumentSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    const [doc] = await db
      .insert(documents)
      .values({
        userId,
        title: input.title,
        content: input.content,
        folderId: input.folderId,
        parentDocumentId: input.parentDocumentId,
      })
      .returning();

    return c.json({ document: doc }, 201);
  }
);

// Update document
documentsRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateDocumentSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    const [doc] = await db
      .update(documents)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return c.json({ document: doc });
  }
);

// Delete document
documentsRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    await db.delete(documents).where(eq(documents.id, id));

    return c.json({ success: true });
  }
);

// Publish document (creates a version snapshot)
documentsRouter.post(
  "/:id/publish",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Get the latest version number
    const [latestVersion] = await db
      .select({ maxVersion: max(documentVersions.versionNumber) })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, id));

    const nextVersionNumber = (latestVersion?.maxVersion ?? 0) + 1;

    // Create a version snapshot
    await db.insert(documentVersions).values({
      documentId: id,
      content: existing.content,
      title: existing.title,
      versionNumber: nextVersionNumber,
      createdBy: userId,
    });

    // Update the document to published
    const [doc] = await db
      .update(documents)
      .set({
        status: "published",
        publishedContent: existing.content,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return c.json({ document: doc });
  }
);

// Unpublish document
documentsRouter.post(
  "/:id/unpublish",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    const [doc] = await db
      .update(documents)
      .set({
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return c.json({ document: doc });
  }
);

// Get version history
documentsRouter.get(
  "/:id/versions",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    const versions = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, id))
      .orderBy(desc(documentVersions.versionNumber));

    return c.json({ versions });
  }
);

// Restore a specific version
documentsRouter.post(
  "/:id/versions/:versionId/restore",
  zValidator("param", versionIdParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id, versionId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [existing] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Get the version to restore
    const [version] = await db
      .select()
      .from(documentVersions)
      .where(
        and(
          eq(documentVersions.id, versionId),
          eq(documentVersions.documentId, id)
        )
      );

    if (!version) {
      return c.json({ error: "Version not found" }, 404);
    }

    // Create a new version with current content before restoring
    const [latestVersion] = await db
      .select({ maxVersion: max(documentVersions.versionNumber) })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, id));

    const nextVersionNumber = (latestVersion?.maxVersion ?? 0) + 1;

    await db.insert(documentVersions).values({
      documentId: id,
      content: existing.content,
      title: existing.title,
      versionNumber: nextVersionNumber,
      createdBy: userId,
    });

    // Restore the document to the selected version
    const [doc] = await db
      .update(documents)
      .set({
        title: version.title,
        content: version.content,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return c.json({ document: doc });
  }
);

// Bulk delete documents
documentsRouter.post(
  "/bulk/delete",
  zValidator("json", bulkDocumentIdsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentIds } = c.req.valid("json");
    const db = createDb(c.env);

    // Verify all documents belong to user
    const existing = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(inArray(documents.id, documentIds), eq(documents.userId, userId)));

    const existingIds = existing.map((d) => d.id);
    if (existingIds.length === 0) {
      return c.json({ error: "No documents found" }, 404);
    }

    await db.delete(documents).where(inArray(documents.id, existingIds));

    return c.json({ success: true, deletedCount: existingIds.length });
  }
);

// Bulk pin/unpin documents
documentsRouter.post(
  "/bulk/pin",
  zValidator("json", bulkDocumentIdsSchema.extend({ isPinned: z.boolean() })),
  async (c) => {
    const userId = c.get("userId");
    const { documentIds, isPinned } = c.req.valid("json");
    const db = createDb(c.env);

    // Verify all documents belong to user
    const existing = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(inArray(documents.id, documentIds), eq(documents.userId, userId)));

    const existingIds = existing.map((d) => d.id);
    if (existingIds.length === 0) {
      return c.json({ error: "No documents found" }, 404);
    }

    await db
      .update(documents)
      .set({ isPinned, updatedAt: new Date() })
      .where(inArray(documents.id, existingIds));

    return c.json({ success: true, updatedCount: existingIds.length });
  }
);
