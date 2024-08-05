import { TURSO_TOKEN, TURSO_URL } from "$env/static/private";
import { createClient } from "@libsql/client";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

export const db = drizzle(client, { schema });

export const adapter = new DrizzleSQLiteAdapter(
  db,
  schema.sessionTable,
  schema.userTable
);
