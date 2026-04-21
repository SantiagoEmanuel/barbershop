import client from "@/db/turso/config.js";
import * as schema from "@/db/turso/schema.js";
import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle(client, { schema });
