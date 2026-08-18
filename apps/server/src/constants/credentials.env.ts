import { config } from "dotenv";
import { coerce, object } from "zod";

const isTest =
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  Boolean(process.env.VITEST_WORKER_ID);

config({
  path: isTest ? [".env.test"] : [".env.dev", ".env"],
});

const Env = object({
  PORT: coerce.number(),
  TURSO_TOKEN: coerce.string().default(""),
  TURSO_URL: coerce.string().default(""),
  SQLITE_DATABASE: coerce.string().default("file:./.data/test.sqlite"),
  JWT_SECRET: coerce.string(),
  HASH_SALT: coerce.number(),
  MAILERSEND_TOKEN: coerce.string(),
  HOST: coerce.string(),
  PUBLIC_WEB_URL: coerce.string(),
  LOCALHOST_IP: coerce.string(),
  NODE_ENV: coerce.string(),
});

export const {
  TURSO_TOKEN,
  TURSO_URL,
  SQLITE_DATABASE,
  PORT,
  JWT_SECRET,
  HASH_SALT,
  MAILERSEND_TOKEN,
  HOST,
  PUBLIC_WEB_URL,
  LOCALHOST_IP,
  NODE_ENV,
} = Env.parse(process.env);
