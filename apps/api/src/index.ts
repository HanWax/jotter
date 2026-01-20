import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware, type AuthEnv, type AuthVariables } from "./middleware/auth.ts";
import { documentsRouter } from "./routes/documents.ts";
import { foldersRouter } from "./routes/folders.ts";
import { tagsRouter } from "./routes/tags.ts";

type Bindings = AuthEnv & {
  ENVIRONMENT: string;
  DATABASE_URL: string;
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

app.route("/api", api);

export default app;
