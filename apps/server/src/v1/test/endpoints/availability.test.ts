import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /api/v1/availability", () => {
  it("devuelve slots para un barbero y fecha válidos", async () => {
    // Obtener un barbero existente
    const barbers = await request(app).get("/api/v1/barber");
    if (barbers.body.data.length === 0) return;

    const barberId = barbers.body.data[0].id;
    // Usar la fecha de mañana para evitar conflictos con slots pasados
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/v1/availability")
      .query({ barberId, date });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("slots");
    expect(res.body.data.slots).toBeInstanceOf(Array);

    if (res.body.data.slots.length > 0) {
      const slot = res.body.data.slots[0];
      expect(slot).toHaveProperty("startTime");
      expect(slot).toHaveProperty("endTime");
    }
  });

  it("devuelve 400 si falta barberId", async () => {
    const res = await request(app)
      .get("/api/v1/availability")
      .query({ date: "2026-08-01" });

    expect(res.status).toBe(400);
  });

  it("devuelve 400 si falta date", async () => {
    const res = await request(app)
      .get("/api/v1/availability")
      .query({ barberId: "some-id" });

    expect(res.status).toBe(400);
  });
});
