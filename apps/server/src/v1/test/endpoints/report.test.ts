import app from "@/config";
import { todayISO } from "@config/utils";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminToken } from "../helpers";

const today = todayISO();
const dateRange = { from: today, to: today };

describe("GET /api/v1/reports/* (admin)", () => {
  it("GET /summary devuelve resumen financiero", async () => {
    const res = await request(app)
      .get("/api/v1/reports/summary")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query(dateRange);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /income devuelve reporte de ingresos", async () => {
    const res = await request(app)
      .get("/api/v1/reports/income")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query(dateRange);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /expenses devuelve reporte de egresos", async () => {
    const res = await request(app)
      .get("/api/v1/reports/expenses")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query(dateRange);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /products devuelve reporte de productos", async () => {
    const res = await request(app)
      .get("/api/v1/reports/products")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query(dateRange);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /services devuelve reporte de servicios", async () => {
    const res = await request(app)
      .get("/api/v1/reports/services")
      .set("Cookie", `auth_token=${adminToken()}`)
      .query(dateRange);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});
