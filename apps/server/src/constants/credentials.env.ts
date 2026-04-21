import { config } from "dotenv";

config();

export const { TURSO_TOKEN, TURSO_URL, PORT, JWT_SECRET, HASH_SALT, NODE_EVN } =
  process.env;
