import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { createDb, type Env } from "../db/index.ts";
import { folders } from "../db/schema.ts";
import {
  createFolderSchema,
  updateFolderSchema,
  idParamSchema,
} from "@jotter/shared";
import type { AuthVariables } from "../middleware/auth.ts";

type FoldersEnv = {
  Bindings: Env & { CLERK_SECRET_KEY: string };
  Variables: AuthVariables;
};

export const foldersRouter = new Hono<FoldersEnv>();

// List folders (tree structure - get root folders)
foldersRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const db = createDb(c.env);

  const userFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId));

  return c.json({ folders: userFolders });
});

// Get single folder
foldersRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));

    if (!folder) {
      return c.json({ error: "Folder not found" }, 404);
    }

    return c.json({ folder });
  }
);

// Create folder
foldersRouter.post(
  "/",
  zValidator("json", createFolderSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    // If parentId provided, verify it exists and belongs to user
    if (input.parentId) {
      const [parent] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, input.parentId), eq(folders.userId, userId)));

      if (!parent) {
        return c.json({ error: "Parent folder not found" }, 404);
      }
    }

    const [folder] = await db
      .insert(folders)
      .values({
        userId,
        name: input.name,
        parentId: input.parentId,
      })
      .returning();

    return c.json({ folder }, 201);
  }
);

// Update folder
foldersRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateFolderSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));

    if (!existing) {
      return c.json({ error: "Folder not found" }, 404);
    }

    // Prevent setting parent to self
    if (input.parentId === id) {
      return c.json({ error: "Folder cannot be its own parent" }, 400);
    }

    const [folder] = await db
      .update(folders)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning();

    return c.json({ folder });
  }
);

// Delete folder
foldersRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));

    if (!existing) {
      return c.json({ error: "Folder not found" }, 404);
    }

    await db.delete(folders).where(eq(folders.id, id));

    return c.json({ success: true });
  }
);
