import app from "@/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /status", () => {
  it("responde 200 con mensaje OK", async () => {
    const res = await request(app).get("/status");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "OK" });
  });
});

describe("Ruta inexistente", () => {
  it("responde 404 para rutas no definidas", async () => {
    const res = await request(app).get("/api/v1/ruta-que-no-existe");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Not found");
  });
});
