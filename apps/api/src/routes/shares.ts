import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, count } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { documents, shares, comments, users } from "../db/schema.ts";
import {
  createShareSchema,
  createCommentSchema,
  idParamSchema,
  paginationSchema,
} from "@jotter/shared";
import { z } from "zod";
import type { AuthVariables } from "../middleware/auth.ts";
import { sendEmail, buildShareNotificationEmail, buildCommentNotificationEmail } from "../services/email.ts";

const shareTokenSchema = z.object({
  token: z.string().min(1),
});

type SharesEnv = {
  Bindings: Env & {
    CLERK_SECRET_KEY: string;
    RESEND_API_KEY?: string;
    WEB_URL?: string;
  };
  Variables: AuthVariables;
};

export const sharesRouter = new Hono<SharesEnv>();

// List shares for a document
sharesRouter.get(
  "/documents/:id/shares",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    const documentShares = await db
      .select()
      .from(shares)
      .where(eq(shares.documentId, id))
      .orderBy(desc(shares.createdAt));

    return c.json({ shares: documentShares });
  }
);

// Create a share for a document
sharesRouter.post(
  "/documents/:id/shares",
  zValidator("param", idParamSchema),
  zValidator("json", createShareSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const { email, expiresAt } = c.req.valid("json");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Generate a unique token
    const token = crypto.randomUUID();

    const [share] = await db
      .insert(shares)
      .values({
        documentId: id,
        email,
        token,
        expiresAt: expiresAt ?? null,
      })
      .returning();

    // Send email notification (non-blocking, don't fail the request if email fails)
    const webUrl = c.env.WEB_URL || "http://localhost:5173";
    const shareUrl = `${webUrl}/shared/${token}`;

    const emailOptions = buildShareNotificationEmail({
      recipientEmail: email,
      documentTitle: doc.title,
      shareUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    // Fire and forget - don't await to avoid blocking response
    c.executionCtx.waitUntil(
      sendEmail(c.env.RESEND_API_KEY, emailOptions).catch((err) => {
        console.error("[Share] Failed to send notification email:", err);
      })
    );

    return c.json({ share }, 201);
  }
);

// Revoke a share
sharesRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    // Get the share and verify it belongs to user's document
    const [share] = await db.select().from(shares).where(eq(shares.id, id));

    if (!share) {
      return c.json({ error: "Share not found" }, 404);
    }

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, share.documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Mark as revoked
    await db
      .update(shares)
      .set({ revoked: true })
      .where(eq(shares.id, id));

    return c.json({ success: true });
  }
);

// Restore (un-revoke) a share
sharesRouter.post(
  "/:id/restore",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    // Get the share and verify it belongs to user's document
    const [share] = await db.select().from(shares).where(eq(shares.id, id));

    if (!share) {
      return c.json({ error: "Share not found" }, 404);
    }

    // Verify document belongs to user
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, share.documentId), eq(documents.userId, userId)));

    if (!doc) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (!share.revoked) {
      return c.json({ error: "Share is not revoked" }, 400);
    }

    // Restore the share
    const [restored] = await db
      .update(shares)
      .set({ revoked: false })
      .where(eq(shares.id, id))
      .returning();

    return c.json({ share: restored });
  }
);

// Public: Get shared document (no auth required)
sharesRouter.get(
  "/shared/:token",
  zValidator("param", shareTokenSchema),
  async (c) => {
    const { token } = c.req.valid("param");
    const db = createDb(c.env);

    // Get the share
    const [share] = await db
      .select()
      .from(shares)
      .where(eq(shares.token, token));

    if (!share) {
      return c.json({ error: "Share not found" }, 404);
    }

    // Check if revoked
    if (share.revoked) {
      return c.json({ error: "This share has been revoked" }, 403);
    }

    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return c.json({ error: "This share has expired" }, 403);
    }

    // Get the document
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, share.documentId));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Return published content if available, otherwise current content
    const content = document.publishedContent ?? document.content;

    return c.json({
      document: {
        id: document.id,
        title: document.title,
        content,
        status: document.status,
        publishedAt: document.publishedAt,
      },
      share: {
        id: share.id,
        email: share.email,
      },
    });
  }
);

// Public: Add comment to shared document (no auth required)
sharesRouter.post(
  "/shared/:token/comments",
  zValidator("param", shareTokenSchema),
  zValidator("json", createCommentSchema),
  async (c) => {
    const { token } = c.req.valid("param");
    const commentData = c.req.valid("json");
    const db = createDb(c.env);

    // Get the share
    const [share] = await db
      .select()
      .from(shares)
      .where(eq(shares.token, token));

    if (!share) {
      return c.json({ error: "Share not found" }, 404);
    }

    // Check if revoked or expired
    if (share.revoked) {
      return c.json({ error: "This share has been revoked" }, 403);
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return c.json({ error: "This share has expired" }, 403);
    }

    // Get the document and owner info for notification
    const [doc] = await db
      .select({
        id: documents.id,
        title: documents.title,
        userId: documents.userId,
      })
      .from(documents)
      .where(eq(documents.id, share.documentId));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Create the comment
    const [comment] = await db
      .insert(comments)
      .values({
        documentId: share.documentId,
        shareId: share.id,
        authorName: commentData.authorName,
        authorEmail: commentData.authorEmail ?? null,
        content: commentData.content,
        selectionStart: commentData.selectionStart,
        selectionEnd: commentData.selectionEnd,
        selectionText: commentData.selectionText,
      })
      .returning();

    // Get document owner's email for notification
    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, doc.userId));

    if (owner?.email) {
      const webUrl = c.env.WEB_URL || "http://localhost:5173";
      const documentUrl = `${webUrl}/documents/${doc.id}`;

      const emailOptions = buildCommentNotificationEmail({
        ownerEmail: owner.email,
        documentTitle: doc.title,
        documentUrl,
        commenterName: commentData.authorName,
        commentContent: commentData.content,
        selectionText: commentData.selectionText || undefined,
      });

      // Fire and forget - don't await to avoid blocking response
      c.executionCtx.waitUntil(
        sendEmail(c.env.RESEND_API_KEY, emailOptions).catch((err) => {
          console.error("[Comment] Failed to send notification email:", err);
        })
      );
    }

    return c.json({ comment }, 201);
  }
);

// Public: Get comments for shared document (with pagination)
sharesRouter.get(
  "/shared/:token/comments",
  zValidator("param", shareTokenSchema),
  zValidator("query", paginationSchema),
  async (c) => {
    const { token } = c.req.valid("param");
    const { limit, offset } = c.req.valid("query");
    const db = createDb(c.env);

    // Get the share
    const [share] = await db
      .select()
      .from(shares)
      .where(eq(shares.token, token));

    if (!share) {
      return c.json({ error: "Share not found" }, 404);
    }

    // Check if revoked or expired
    if (share.revoked) {
      return c.json({ error: "This share has been revoked" }, 403);
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return c.json({ error: "This share has expired" }, 403);
    }

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(comments)
      .where(eq(comments.documentId, share.documentId));

    const total = countResult?.total ?? 0;

    // Get paginated comments
    const documentComments = await db
      .select()
      .from(comments)
      .where(eq(comments.documentId, share.documentId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      comments: documentComments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + documentComments.length < total,
      },
    });
  }
);
