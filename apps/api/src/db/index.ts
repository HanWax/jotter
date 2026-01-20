import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";

export type Env = {
  DATABASE_URL: string;
};

export function createDb(env: Env) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
