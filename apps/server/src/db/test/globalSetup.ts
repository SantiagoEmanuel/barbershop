import { mkdirSync, rmSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { SQLITE_DATABASE } from "../../constants/credentials.env";

function sqliteFilePath(url: string): string | null {
  if (url === ":memory:" || url === "file::memory:") return null;
  const path = url.startsWith("file:") ? url.slice("file:".length) : url;
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

export async function setup() {
  const databasePath = sqliteFilePath(SQLITE_DATABASE);
  if (databasePath) {
    mkdirSync(dirname(databasePath), { recursive: true });
    for (const suffix of ["", "-shm", "-wal"]) {
      rmSync(`${databasePath}${suffix}`, { force: true });
    }
  }

  const [{ db }, { migrate }] = await Promise.all([
    import("../../db/db"),
    import("drizzle-orm/libsql/migrator"),
  ]);

  await migrate(db, {
    migrationsFolder: resolve(process.cwd(), "src/db/test/migrations"),
  });
}
