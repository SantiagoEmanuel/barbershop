import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminToken, clientToken, devToken } from "../helpers";

/**
 * Tests de autorización: verifica que los endpoints protegidos
 * devuelven 401 sin token y 403 con rol insuficiente.
 */
describe("Endpoints protegidos — sin token devuelven 401", () => {
  const protectedGET = [
    "/api/v1/auth/get-admins",
    "/api/v1/auth/users",
    "/api/v1/auth/me",
    "/api/v1/auth/permissions",
    "/api/v1/auth/roles",
    "/api/v1/barber/me",
    "/api/v1/appointments/my",
    "/api/v1/supplies",
    "/api/v1/purchases",
    "/api/v1/expenses",
    "/api/v1/expenses/categories",
    "/api/v1/expenses/recurring",
    "/api/v1/reports/summary",
    "/api/v1/order/all",
  ];

  for (const path of protectedGET) {
    it(`GET ${path} → 401`, async () => {
      const res = await request(app).get(path);
      expect(res.status).toBe(401);
    });
  }
});

it("rechaza un JWT inválido con 401 y no con 500", async () => {
  const res = await request(app)
    .get("/api/v1/reports/summary")
    .set("Cookie", "auth_token=no-es-un-jwt");

  expect(res.status).toBe(401);
});

describe("Endpoints admin — con rol client devuelven 403", () => {
  const adminOnlyGET = [
    "/api/v1/auth/get-admins",
    "/api/v1/auth/users",
    "/api/v1/supplies",
    "/api/v1/purchases",
    "/api/v1/expenses",
    "/api/v1/reports/summary",
  ];

  for (const path of adminOnlyGET) {
    it(`GET ${path} → 403`, async () => {
      const res = await request(app)
        .get(path)
        .set("Cookie", `auth_token=${clientToken()}`);

      expect(res.status).toBe(403);
    });
  }
});

describe("Endpoints admin — con token admin responden correctamente", () => {
  const adminGET = [
    "/api/v1/auth/get-admins",
    "/api/v1/auth/users",
    "/api/v1/supplies",
    "/api/v1/expenses/categories",
    "/api/v1/expenses/recurring",
    "/api/v1/payment-methods",
  ];

  for (const path of adminGET) {
    it(`GET ${path} → 200`, async () => {
      const res = await request(app)
        .get(path)
        .set("Cookie", `auth_token=${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  }
});

it("permite a dev acceder a un endpoint administrativo mediante permisos", async () => {
  const res = await request(app)
    .get("/api/v1/reports/summary")
    .set("Cookie", `auth_token=${devToken()}`);

  expect(res.status).toBe(200);
});

describe("POST protegidos — sin token devuelven 401", () => {
  const protectedPOST = [
    { path: "/api/v1/barber", body: { name: "Test" } },
    { path: "/api/v1/service", body: { name: "Test" } },
    { path: "/api/v1/product", body: { name: "Test" } },
    { path: "/api/v1/supplies", body: { name: "Test" } },
    { path: "/api/v1/order", body: {} },
  ];

  for (const { path, body } of protectedPOST) {
    it(`POST ${path} → 401`, async () => {
      const res = await request(app).post(path).send(body);
      expect(res.status).toBe(401);
    });
  }
});
