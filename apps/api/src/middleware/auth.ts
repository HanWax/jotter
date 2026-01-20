import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import { HTTPException } from "hono/http-exception";

export type AuthEnv = {
  CLERK_SECRET_KEY: string;
};

export type AuthVariables = {
  userId: string;
};

export const authMiddleware = createMiddleware<{
  Bindings: AuthEnv;
  Variables: AuthVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    if (!payload.sub) {
      throw new HTTPException(401, { message: "Invalid token: missing subject" });
    }

    c.set("userId", payload.sub);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
});
