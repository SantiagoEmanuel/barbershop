import { config } from "dotenv";
import { coerce, object, string } from "zod";

config({ path: [".env", ".env.local"] });

const Env = object({
  PORT: coerce.string(),
  TURSO_TOKEN: string(),
  TURSO_URL: string(),
  JWT_SECRET: string(),
  HASH_SALT: coerce.number(),
  MAILERSEND_TOKEN: string(),
  HOST: string(),
  MP_ACCESS_TOKEN: string(),
  MP_WEBHOOK_SECRET: string(),
  PUBLIC_API_URL: string(),
  PUBLIC_WEB_URL: string(),
  LOCALHOST_IP: string(),
  NODE_ENV: string(),
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
