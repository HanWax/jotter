import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { documents, documentVersions } from "../db/schema.ts";
import {
  createDocumentSchema,
  updateDocumentSchema,
  idParamSchema,
} from "@jotter/shared";
import type { AuthVariables } from "../middleware/auth.ts";

type DocumentsEnv = {
  Bindings: Env & { CLERK_SECRET_KEY: string };
  Variables: AuthVariables;
};

export const documentsRouter = new Hono<DocumentsEnv>();

// List documents
documentsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const db = createDb(c.env);

  const userDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt));

  return c.json({ documents: userDocs });
});

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

// Publish document
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
