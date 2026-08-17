import { describe, expect, it } from "vitest";
import { getRolePermissions, hasPermission, PERMISSIONS } from "./permissions";

describe("RBAC permissions", () => {
  it("keeps client permissions limited to its own operations", () => {
    expect(hasPermission("client", PERMISSIONS.APPOINTMENTS_READ_OWN)).toBe(
      true,
    );
    expect(hasPermission("client", PERMISSIONS.APPOINTMENTS_READ_ANY)).toBe(
      false,
    );
    expect(hasPermission("client", PERMISSIONS.FINANCE_MANAGE)).toBe(false);
  });

  it("gives barber only operational permissions in addition to client permissions", () => {
    expect(hasPermission("barber", PERMISSIONS.SALES_CREATE)).toBe(true);
    expect(hasPermission("barber", PERMISSIONS.APPOINTMENTS_OVERBOOK)).toBe(
      true,
    );
    expect(hasPermission("barber", PERMISSIONS.REPORTS_READ)).toBe(false);
  });

  it("gives admin business permissions without development permissions", () => {
    expect(hasPermission("admin", PERMISSIONS.REPORTS_READ)).toBe(true);
    expect(hasPermission("admin", PERMISSIONS.CATALOG_MANAGE)).toBe(true);
    expect(hasPermission("admin", PERMISSIONS.DEVELOPMENT_ACCESS)).toBe(false);
  });

  it("gives dev every declared permission", () => {
    for (const permission of Object.values(PERMISSIONS)) {
      expect(hasPermission("dev", permission)).toBe(true);
    }

    expect(getRolePermissions("dev")).toHaveLength(
      Object.values(PERMISSIONS).length,
    );
  });
});
