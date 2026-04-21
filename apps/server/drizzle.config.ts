import { defineConfig } from "drizzle-kit";
import { TURSO_TOKEN, TURSO_URL } from "./src/constants/credentials.env";

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    authToken: TURSO_TOKEN!,
    url: TURSO_URL!,
  },
  schema: "./src/db/turso/schema.ts",
  out: "./db/turso/generate/",
});
