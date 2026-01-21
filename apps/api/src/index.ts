import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware, type AuthEnv, type AuthVariables } from "./middleware/auth.ts";
import { documentsRouter } from "./routes/documents.ts";
import { foldersRouter } from "./routes/folders.ts";
import { tagsRouter } from "./routes/tags.ts";
import { assetsRouter } from "./routes/assets.ts";
import { sharesRouter } from "./routes/shares.ts";
import { commentsRouter } from "./routes/comments.ts";

type Bindings = AuthEnv & {
  ENVIRONMENT: string;
  DATABASE_URL: string;
  ASSETS_BUCKET: R2Bucket;
  ASSETS_PUBLIC_URL?: string;
};

type Variables = AuthVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/", (c) => {
  return c.json({
    name: "Jotter API",
    version: "0.0.1",
  });
});

const api = new Hono<{ Bindings: Bindings; Variables: Variables }>();
api.use("*", authMiddleware);

api.get("/me", (c) => {
  const userId = c.get("userId");
  return c.json({ userId });
});

api.route("/documents", documentsRouter);
api.route("/folders", foldersRouter);
api.route("/tags", tagsRouter);
api.route("/assets", assetsRouter);
api.route("/shares", sharesRouter);
api.route("/comments", commentsRouter);

app.route("/api", api);

// Public routes (no auth required)
app.route("/api", sharesRouter);

export default app;
