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

  await db.insert((await import("../../db/turso/schema")).users).values([
    {
      id: "test-dev-id",
      name: "Test Developer",
      email: "dev@test.com",
      username: "test_dev",
      password: "test-password-hash",
      role: "dev",
      phone: "+5493510000100",
      isActive: true,
      verify: true,
    },
    {
      id: "test-admin-id",
      name: "Test Admin",
      email: "admin@test.com",
      username: "test_admin",
      password: "test-password-hash",
      role: "admin",
      phone: "+5493510000101",
      isActive: true,
      verify: true,
    },
    {
      id: "test-role-target-id",
      name: "Role Target",
      email: "role-target@test.com",
      username: "role_target",
      password: "test-password-hash",
      role: "client",
      phone: "+5493510000103",
      isActive: true,
      verify: true,
    },
    {
      id: "test-client-id",
      name: "Test Client",
      email: "client@test.com",
      username: "test_client",
      password: "test-password-hash",
      role: "client",
      phone: "+5493510000102",
      isActive: true,
      verify: true,
    },
  ]);
}
