import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/service", () => {
  it("lista servicios activos", async () => {
    const res = await request(app).get("/api/v1/service");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);

    if (res.body.data.length > 0) {
      const service = res.body.data[0];
      expect(service).toHaveProperty("id");
      expect(service).toHaveProperty("name");
      expect(service).toHaveProperty("price");
      expect(service).toHaveProperty("durationMinutes");
      expect(typeof service.price).toBe("number");
      expect(typeof service.durationMinutes).toBe("number");
    }
  });

  it("solo devuelve servicios activos sin autenticación", async () => {
    const res = await request(app).get("/api/v1/service");

    expect(res.status).toBe(200);
    for (const service of res.body.data) {
      expect(service.isActive).toBeTruthy();
    }
  });
});

describe("GET /api/v1/service/:id", () => {
  it("devuelve un servicio por ID", async () => {
    const list = await request(app).get("/api/v1/service");
    if (list.body.data.length === 0) return;

    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/v1/service/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("devuelve 404 para un ID inexistente", async () => {
    const res = await request(app).get(
      "/api/v1/service/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });
});
