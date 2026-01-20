import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { tags, documentTags, documents } from "../db/schema.ts";
import {
  createTagSchema,
  updateTagSchema,
  idParamSchema,
  documentTagParamsSchema,
} from "@jotter/shared";
import type { AuthVariables } from "../middleware/auth.ts";

type TagsEnv = {
  Bindings: Env & { CLERK_SECRET_KEY: string };
  Variables: AuthVariables;
};

export const tagsRouter = new Hono<TagsEnv>();

// List tags
tagsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const db = createDb(c.env);

  const userTags = await db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId));

  return c.json({ tags: userTags });
});

// Get single tag
tagsRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [tag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)));

    if (!tag) {
      return c.json({ error: "Tag not found" }, 404);
    }

    return c.json({ tag });
  }
);

// Create tag
tagsRouter.post(
  "/",
  zValidator("json", createTagSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    const [tag] = await db
      .insert(tags)
      .values({
        userId,
        name: input.name,
        color: input.color,
      })
      .returning();

    return c.json({ tag }, 201);
  }
);

// Update tag
tagsRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateTagSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)));

    if (!existing) {
      return c.json({ error: "Tag not found" }, 404);
    }

    const [tag] = await db
      .update(tags)
      .set(input)
      .where(eq(tags.id, id))
      .returning();

    return c.json({ tag });
  }
);

// Delete tag
tagsRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)));

    if (!existing) {
      return c.json({ error: "Tag not found" }, 404);
    }

    await db.delete(tags).where(eq(tags.id, id));

    return c.json({ success: true });
  }
);

// Add tag to document
tagsRouter.post(
  "/documents/:documentId/tags/:tagId",
  zValidator("param", documentTagParamsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId, tagId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Verify tag belongs to user
    const [tag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));

    if (!tag) {
      return c.json({ error: "Tag not found" }, 404);
    }

    await db
      .insert(documentTags)
      .values({ documentId, tagId })
      .onConflictDoNothing();

    return c.json({ success: true });
  }
);

// Remove tag from document
tagsRouter.delete(
  "/documents/:documentId/tags/:tagId",
  zValidator("param", documentTagParamsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId, tagId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    await db
      .delete(documentTags)
      .where(
        and(
          eq(documentTags.documentId, documentId),
          eq(documentTags.tagId, tagId)
        )
      );

    return c.json({ success: true });
  }
);
