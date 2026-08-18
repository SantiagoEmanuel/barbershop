import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminToken, clientToken, devToken, roleTargetToken } from "../helpers";

describe("Permisos del usuario autenticado", () => {
  it("devuelve el rol y permisos efectivos", async () => {
    const res = await request(app)
      .get("/api/v1/auth/permissions")
      .set("Cookie", `auth_token=${clientToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("client");
    expect(res.body.data.permissions).toContain("appointments:read:own");
    expect(res.body.data.permissions).not.toContain("finance:manage");
  });

  it("devuelve el usuario actual con permisos", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `auth_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("admin");
    expect(res.body.data.permissions).toContain("users:manage");
  });
});

describe("Administración de roles", () => {
  it("solo permite listar la matriz de roles a quien administra usuarios", async () => {
    const forbidden = await request(app)
      .get("/api/v1/auth/roles")
      .set("Cookie", `auth_token=${clientToken()}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .get("/api/v1/auth/roles")
      .set("Cookie", `auth_token=${adminToken()}`);
    expect(allowed.status).toBe(200);
    expect(allowed.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "dev" }),
        expect.objectContaining({ role: "admin" }),
      ]),
    );
  });

  it("rechaza roles inválidos y cambios de rol por un cliente", async () => {
    const invalid = await request(app)
      .patch("/api/v1/auth/users/test-role-target-id/role")
      .set("Cookie", `auth_token=${adminToken()}`)
      .send({ role: "owner" });
    expect(invalid.status).toBe(400);

    const forbidden = await request(app)
      .patch("/api/v1/auth/users/test-role-target-id/role")
      .set("Cookie", `auth_token=${clientToken()}`)
      .send({ role: "barber" });
    expect(forbidden.status).toBe(403);
  });

  it("permite a admin cambiar roles operativos e invalida el token anterior", async () => {
    const changed = await request(app)
      .patch("/api/v1/auth/users/test-role-target-id/role")
      .set("Cookie", `auth_token=${adminToken()}`)
      .send({ role: "barber" });

    expect(changed.status).toBe(200);
    expect(changed.body.data.role).toBe("barber");
    expect(changed.body.data.permissions).toContain("sales:create");

    const staleToken = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `auth_token=${roleTargetToken()}`);
    expect(staleToken.status).toBe(401);
  });

  it("impide que admin asigne o administre dev", async () => {
    const res = await request(app)
      .patch("/api/v1/auth/users/test-role-target-id/role")
      .set("Cookie", `auth_token=${adminToken()}`)
      .send({ role: "dev" });

    expect(res.status).toBe(403);
  });

  it("permite a dev administrar roles y no permite cambiarse a sí mismo", async () => {
    const changed = await request(app)
      .patch("/api/v1/auth/users/test-role-target-id/role")
      .set("Cookie", `auth_token=${devToken()}`)
      .send({ role: "client" });
    expect(changed.status).toBe(200);

    const selfChange = await request(app)
      .patch("/api/v1/auth/users/test-dev-id/role")
      .set("Cookie", `auth_token=${devToken()}`)
      .send({ role: "client" });
    expect(selfChange.status).toBe(400);
  });
});
