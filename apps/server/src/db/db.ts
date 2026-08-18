import {
  NODE_ENV,
  SQLITE_DATABASE,
  TURSO_TOKEN,
  TURSO_URL,
} from "@/constants/credentials.env";
import * as schema from "@/db/turso/schema.js";
import { createClient as createTursoClient } from "@libsql/client";
import { createClient as createLocalSqliteClient } from "@libsql/client/sqlite3";
import { drizzle } from "drizzle-orm/libsql";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql/sqlite3";

const isTest = NODE_ENV === "test";

/**
 * Producción usa Turso; Vitest usa un archivo SQLite local configurado en
 * SQLITE_DATABASE. Ambos clientes implementan el mismo dialecto SQLite y
 * comparten el esquema y los modelos.
 */
export const db = isTest
  ? drizzleSqlite(createLocalSqliteClient({ url: SQLITE_DATABASE }), { schema })
  : drizzle(
      createTursoClient({
        authToken: TURSO_TOKEN || undefined,
        url: TURSO_URL,
      }),
      { schema },
    );

/**
 * Acepta tanto la conexión `db` como una transacción Drizzle. Útil para
 * helpers de modelo que pueden correr sueltos o dentro de db.transaction().
 */
export type DbOrTx =
  typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
