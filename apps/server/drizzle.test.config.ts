import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/turso/schema.ts",
  out: "./src/db/test/migrations",
  dbCredentials: {
    url: "file:./.data/test.sqlite",
  },
});
