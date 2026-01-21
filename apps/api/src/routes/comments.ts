import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { documents, comments } from "../db/schema.ts";
import {
  createCommentSchema,
  updateCommentSchema,
  idParamSchema,
} from "@jotter/shared";
import { z } from "zod";
import type { AuthVariables } from "../middleware/auth.ts";

const documentCommentParamsSchema = z.object({
  documentId: z.string().uuid(),
});

type CommentsEnv = {
  Bindings: Env & { CLERK_SECRET_KEY: string };
  Variables: AuthVariables;
};

export const commentsRouter = new Hono<CommentsEnv>();

// Get comments for a document
commentsRouter.get(
  "/documents/:documentId/comments",
  zValidator("param", documentCommentParamsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    const documentComments = await db
      .select()
      .from(comments)
      .where(eq(comments.documentId, documentId))
      .orderBy(desc(comments.createdAt));

    return c.json({ comments: documentComments });
  }
);

// Create a comment on a document (as owner)
commentsRouter.post(
  "/documents/:documentId/comments",
  zValidator("param", documentCommentParamsSchema),
  zValidator("json", createCommentSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId } = c.req.valid("param");
    const commentData = c.req.valid("json");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    const [comment] = await db
      .insert(comments)
      .values({
        documentId,
        authorName: commentData.authorName,
        authorEmail: commentData.authorEmail ?? null,
        content: commentData.content,
        selectionStart: commentData.selectionStart,
        selectionEnd: commentData.selectionEnd,
        selectionText: commentData.selectionText,
      })
      .returning();

    return c.json({ comment }, 201);
  }
);

// Update a comment (resolve/update content)
commentsRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateCommentSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const updateData = c.req.valid("json");
    const db = createDb(c.env);

    // Get the comment
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));

    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, comment.documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const [updated] = await db
      .update(comments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    return c.json({ comment: updated });
  }
);

// Delete a comment
commentsRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    // Get the comment
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));

    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, comment.documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(comments).where(eq(comments.id, id));

    return c.json({ success: true });
  }
);
