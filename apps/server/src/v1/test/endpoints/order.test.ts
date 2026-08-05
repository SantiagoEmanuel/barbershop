import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminToken } from "../helpers";

describe("GET /api/v1/order (admin)", () => {
  it("rechaza sin autenticación", async () => {
    const res = await request(app).get("/api/v1/order");

    expect(res.status).toBe(401);
  });

  it("devuelve órdenes con token admin", async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app)
      .get("/api/v1/order")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query({ date: today });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});

describe("GET /api/v1/order/all (admin)", () => {
  it("lista todas las órdenes con token admin", async () => {
    const res = await request(app)
      .get("/api/v1/order/all")
      .set("Cookie", `auth_token=${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe("GET /api/v1/order/:id (admin)", () => {
  it("devuelve 404 para un ID inexistente", async () => {
    const res = await request(app)
      .get("/api/v1/order/00000000-0000-0000-0000-000000000000")
      .set("Cookie", `auth_token=${adminToken()}`);

    expect(res.status).toBe(404);
  });
});
