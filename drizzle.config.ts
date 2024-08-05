import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
  },
});
