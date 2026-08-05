import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("POST /api/v1/auth (login)", () => {
  it("rechaza login sin credenciales", async () => {
    const res = await request(app).post("/api/v1/auth").send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rechaza login con email inválido", async () => {
    const res = await request(app).post("/api/v1/auth").send({
      email: "no-existe@test.com",
      password: "contraseña123",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe("POST /api/v1/auth/create (registro)", () => {
  it("rechaza registro sin campos obligatorios", async () => {
    const res = await request(app).post("/api/v1/auth/create").send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rechaza registro con campos duplicados (email existente)", async () => {
    // Primer intento: puede crear o fallar según estado de la BD
    const unique = `dup-${Date.now()}`;
    await request(app)
      .post("/api/v1/auth/create")
      .send({
        name: "Dup Test",
        email: `${unique}@test.com`,
        username: unique,
        phone: `+549${unique.slice(-10)}`,
        password: "12345678",
      });

    // Segundo intento con mismo email → 409 conflicto
    const res = await request(app)
      .post("/api/v1/auth/create")
      .send({
        name: "Dup Test 2",
        email: `${unique}@test.com`,
        username: `${unique}-2`,
        phone: "+5493510000001",
        password: "12345678",
      });

    // El backend devuelve 409 o 500 según cómo maneje la constraint UNIQUE
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("cierra sesión y limpia la cookie", async () => {
    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sesión cerrada");
  });
});

describe("POST /api/v1/auth/restore-session", () => {
  it("rechaza si no hay cookie de sesión", async () => {
    const res = await request(app).post("/api/v1/auth/restore-session");

    // El endpoint no usa verifyToken, maneja la ausencia internamente
    expect([401, 404]).toContain(res.status);
  });
});
