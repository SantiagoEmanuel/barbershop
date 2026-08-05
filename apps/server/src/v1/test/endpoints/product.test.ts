import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/product", () => {
  it("lista productos activos", async () => {
    const res = await request(app).get("/api/v1/product");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);

    if (res.body.data.length > 0) {
      const product = res.body.data[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("stock");
      expect(typeof product.price).toBe("number");
    }
  });
});

describe("GET /api/v1/product/:id", () => {
  it("devuelve un producto por ID", async () => {
    const list = await request(app).get("/api/v1/product");
    if (list.body.data.length === 0) return;

    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/v1/product/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("devuelve 404 para un ID inexistente", async () => {
    const res = await request(app).get(
      "/api/v1/product/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });
});
