import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/payment-methods", () => {
  it("lista métodos de pago activos", async () => {
    const res = await request(app).get("/api/v1/payment-methods");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);

    if (res.body.data.length > 0) {
      const method = res.body.data[0];
      expect(method).toHaveProperty("id");
      expect(method).toHaveProperty("name");
      expect(method).toHaveProperty("type");
    }
  });
});

describe("GET /api/v1/payment-methods/:id", () => {
  it("devuelve un método de pago por ID", async () => {
    const list = await request(app).get("/api/v1/payment-methods");
    if (list.body.data.length === 0) return;

    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/v1/payment-methods/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("devuelve 404 para un ID inexistente", async () => {
    const res = await request(app).get(
      "/api/v1/payment-methods/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });
});
