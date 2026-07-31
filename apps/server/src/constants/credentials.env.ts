import { config } from "dotenv";
import { coerce, object } from "zod";

config({ path: [".env", ".env.local", ".env.dev"] });

const Env = object({
  PORT: coerce.number(),
  TURSO_TOKEN: coerce.string(),
  TURSO_URL: coerce.string(),
  JWT_SECRET: coerce.string(),
  HASH_SALT: coerce.number(),
  MAILERSEND_TOKEN: coerce.string(),
  HOST: coerce.string(),
  MP_ACCESS_TOKEN: coerce.string(),
  MP_WEBHOOK_SECRET: coerce.string(),
  PUBLIC_API_URL: coerce.string(),
  PUBLIC_WEB_URL: coerce.string(),
  LOCALHOST_IP: coerce.string(),
  NODE_ENV: coerce.string(),
});

export const {
  TURSO_TOKEN,
  TURSO_URL,
  PORT,
  JWT_SECRET,
  HASH_SALT,
  MAILERSEND_TOKEN,
  HOST,
  MP_ACCESS_TOKEN,
  MP_WEBHOOK_SECRET,
  PUBLIC_API_URL,
  PUBLIC_WEB_URL,
  LOCALHOST_IP,
  NODE_ENV,
} = Env.parse(process.env);
