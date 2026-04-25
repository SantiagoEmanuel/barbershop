import app from "@/app/app";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("Prueba endpoint '/api/payment-methods'", () => {
  it("debe responder correctamente a GET /api/usuario", async () => {
    const response = await request(app).get("/api/payment-methods");

    // Esperamos una respuesta 200
    expect(response.status).toBe(200);

    // Vitest verifica el contenido del cuerpo
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(3);
  });
});
