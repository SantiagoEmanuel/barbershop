import { config } from "dotenv";
import { coerce, object, string } from "zod";

config();

const Env = object({
  PORT: coerce.string(),
  TURSO_TOKEN: string(),
  TURSO_URL: string(),
  JWT_SECRET: string(),
  HASH_SALT: coerce.number(),
  MAILERSEND_TOKEN: string(),
  HOST: string(),
});

export const {
  TURSO_TOKEN,
  TURSO_URL,
  PORT,
  JWT_SECRET,
  HASH_SALT,
  MAILERSEND_TOKEN,
  HOST,
} = Env.parse(process.env);
