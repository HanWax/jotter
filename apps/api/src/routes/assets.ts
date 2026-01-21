import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { assets, documentAssets, documents } from "../db/schema.ts";
import {
  requestUploadUrlSchema,
  createAssetSchema,
  idParamSchema,
  paginationSchema,
  documentAssetParamsSchema,
} from "@jotter/shared";
import type { AuthVariables } from "../middleware/auth.ts";

type AssetsEnv = {
  Bindings: Env & {
    CLERK_SECRET_KEY: string;
    ASSETS_BUCKET: R2Bucket;
    ASSETS_PUBLIC_URL?: string;
  };
  Variables: AuthVariables;
};

export const assetsRouter = new Hono<AssetsEnv>();

// List all assets for the current user
assetsRouter.get(
  "/",
  zValidator("query", paginationSchema),
  async (c) => {
    const userId = c.get("userId");
    const { limit, offset } = c.req.valid("query");
    const db = createDb(c.env);

    const userAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(assets.createdAt));

    return c.json({ assets: userAssets });
  }
);

// Get a single asset
assetsRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, id), eq(assets.userId, userId)));

    if (!asset) {
      return c.json({ error: "Asset not found" }, 404);
    }

    return c.json({ asset });
  }
);

// Request a presigned upload URL
assetsRouter.post(
  "/upload",
  zValidator("json", requestUploadUrlSchema),
  async (c) => {
    const userId = c.get("userId");
    const { filename, mimeType } = c.req.valid("json");

    // Generate a unique R2 key
    const timestamp = Date.now();
    const randomId = crypto.randomUUID();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const r2Key = `${userId}/${timestamp}-${randomId}-${sanitizedFilename}`;

    // Return upload info - client will upload directly
    return c.json({
      uploadUrl: `/api/assets/upload/${encodeURIComponent(r2Key)}`,
      r2Key,
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
    });
  }
);

// Direct upload endpoint - receives the file and stores in R2
assetsRouter.put(
  "/upload/:key{.+}",
  async (c) => {
    const userId = c.get("userId");
    const r2Key = c.req.param("key");

    // Verify the key belongs to this user
    if (!r2Key.startsWith(userId)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const contentType = c.req.header("Content-Type") || "application/octet-stream";
    const body = await c.req.arrayBuffer();

    // Upload to R2
    await c.env.ASSETS_BUCKET.put(r2Key, body, {
      httpMetadata: {
        contentType,
      },
    });

    // Generate the public URL
    const publicUrl = c.env.ASSETS_PUBLIC_URL
      ? `${c.env.ASSETS_PUBLIC_URL}/${r2Key}`
      : `/api/assets/file/${r2Key}`;

    return c.json({
      success: true,
      r2Key,
      url: publicUrl,
      sizeBytes: body.byteLength,
    });
  }
);

// Create asset record after successful upload
assetsRouter.post(
  "/",
  zValidator("json", createAssetSchema),
  async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");
    const db = createDb(c.env);

    // Verify the R2 key belongs to this user
    if (!data.r2Key.startsWith(userId)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Generate URL
    const url = c.env.ASSETS_PUBLIC_URL
      ? `${c.env.ASSETS_PUBLIC_URL}/${data.r2Key}`
      : `/api/assets/file/${data.r2Key}`;

    const [asset] = await db
      .insert(assets)
      .values({
        userId,
        filename: data.filename,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        r2Key: data.r2Key,
        url,
      })
      .returning();

    return c.json({ asset }, 201);
  }
);

// Serve asset file from R2
assetsRouter.get(
  "/file/:key{.+}",
  async (c) => {
    const r2Key = c.req.param("key");

    const object = await c.env.ASSETS_BUCKET.get(r2Key);

    if (!object) {
      return c.json({ error: "Asset not found" }, 404);
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  }
);

// Delete an asset
assetsRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, id), eq(assets.userId, userId)));

    if (!asset) {
      return c.json({ error: "Asset not found" }, 404);
    }

    // Delete from R2
    await c.env.ASSETS_BUCKET.delete(asset.r2Key);

    // Delete from database (cascade will remove document_assets)
    await db.delete(assets).where(eq(assets.id, id));

    return c.json({ success: true });
  }
);

// Link asset to document
assetsRouter.post(
  "/documents/:documentId/assets/:assetId",
  zValidator("param", documentAssetParamsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId, assetId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Verify asset belongs to user
    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)));

    if (!asset) {
      return c.json({ error: "Asset not found" }, 404);
    }

    // Create link (ignore if already exists)
    await db
      .insert(documentAssets)
      .values({ documentId, assetId })
      .onConflictDoNothing();

    return c.json({ success: true }, 201);
  }
);

// Unlink asset from document
assetsRouter.delete(
  "/documents/:documentId/assets/:assetId",
  zValidator("param", documentAssetParamsSchema),
  async (c) => {
    const userId = c.get("userId");
    const { documentId, assetId } = c.req.valid("param");
    const db = createDb(c.env);

    // Verify document belongs to user
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    await db
      .delete(documentAssets)
      .where(
        and(
          eq(documentAssets.documentId, documentId),
          eq(documentAssets.assetId, assetId)
        )
      );

    return c.json({ success: true });
  }
);
