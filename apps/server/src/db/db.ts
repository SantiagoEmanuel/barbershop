import client from "@/db/turso/config.js";
import * as schema from "@/db/turso/schema.js";
import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle(client, { schema });

/**
 * Acepta tanto la conexión `db` como una transacción Drizzle. Útil para
 * helpers de modelo que pueden correr sueltos o dentro de db.transaction().
 */
export type DbOrTx =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];
