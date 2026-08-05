import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/barber", () => {
  it("lista barberos activos", async () => {
    const res = await request(app).get("/api/v1/barber");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);

    if (res.body.data.length > 0) {
      const barber = res.body.data[0];
      expect(barber).toHaveProperty("id");
      expect(barber).toHaveProperty("name");
      expect(barber).toHaveProperty("slug");
      expect(barber).toHaveProperty("isActive");
    }
  });

  it("solo devuelve barberos activos para usuarios no autenticados", async () => {
    const res = await request(app).get("/api/v1/barber");

    expect(res.status).toBe(200);
    for (const barber of res.body.data) {
      expect(barber.isActive).toBeTruthy();
    }
  });
});

describe("GET /api/v1/barber/:slug", () => {
  it("devuelve 404 para un slug inexistente", async () => {
    const res = await request(app).get("/api/v1/barber/slug-que-no-existe");

    expect(res.status).toBe(404);
  });

  it("devuelve un barbero por slug", async () => {
    // Obtener un slug válido primero
    const list = await request(app).get("/api/v1/barber");
    if (list.body.data.length === 0) return;

    const slug = list.body.data[0].slug;
    const res = await request(app).get(`/api/v1/barber/${slug}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data.slug).toBe(slug);
  });
});
