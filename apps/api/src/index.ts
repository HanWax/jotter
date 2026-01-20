import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

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

export default app;
