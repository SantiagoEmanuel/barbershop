import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminToken, clientToken } from "../helpers";

describe("POST /api/v1/appointments (crear turno)", () => {
  it("rechaza sin campos obligatorios", async () => {
    const res = await request(app).post("/api/v1/appointments").send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rechaza con barberId inexistente", async () => {
    const res = await request(app).post("/api/v1/appointments").send({
      barberId: "00000000-0000-0000-0000-000000000000",
      serviceId: "00000000-0000-0000-0000-000000000000",
      date: "2026-08-15",
      startTime: "10:00",
      clientName: "Test User",
      clientPhone: "+5493510000000",
      clientEmail: "test@test.com",
    });

    // Puede ser 400 o 404 según validación del modelo
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rechaza que el frontend envíe status, precio o fin calculado", async () => {
    const res = await request(app).post("/api/v1/appointments").send({
      barberId: "barber-id",
      serviceId: "service-id",
      date: "2026-08-15",
      startTime: "10:00",
      clientName: "Test User",
      clientPhone: "+5493510000000",
      clientEmail: "test@test.com",
      status: "confirmed",
      priceSnapshot: 1,
      endTime: "10:01",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/appointments (admin)", () => {
  it("rechaza sin autenticación", async () => {
    const res = await request(app).get("/api/v1/appointments");

    expect(res.status).toBe(401);
    expect(res.body.data).toBeNull();
  });

  it("rechaza con rol client", async () => {
    const res = await request(app)
      .get("/api/v1/appointments")
      .set("Cookie", `auth_token=${clientToken()}`);

    expect(res.status).toBe(403);
  });

  it("devuelve turnos con token admin", async () => {
    const res = await request(app)
      .get("/api/v1/appointments")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query({ date: "2026-08-01", barberId: "any" });

    // 200 si hay turnos o 200 con array vacío
    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/appointments/my", () => {
  it("rechaza sin autenticación", async () => {
    const res = await request(app).get("/api/v1/appointments/my");

    expect(res.status).toBe(401);
  });

  it("devuelve historial con token de cliente", async () => {
    const res = await request(app)
      .get("/api/v1/appointments/my")
      .set("Cookie", `auth_token=${clientToken()}`);

    expect(res.status).toBe(200);
  });
});
