import { JWT_SECRET } from "@/constants/credentials.env";
import type { JwtPayload } from "@/middleware/auth.middleware";
import jwt from "jsonwebtoken";

/**
 * Genera un JWT firmado para usar en tests que requieren autenticación.
 * El token se envía como cookie `auth_token` via supertest:
 *
 *   request(app)
 *     .get("/api/v1/protected")
 *     .set("Cookie", `auth_token=${adminToken()}`)
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

/** Token con rol admin para tests de endpoints protegidos */
export function adminToken(): string {
  return signToken({
    id: "test-admin-id",
    role: "admin",
    email: "admin@test.com",
  });
}

/** Token con todos los permisos operativos y de desarrollo. */
export function devToken(): string {
  return signToken({
    id: "test-dev-id",
    role: "dev",
    email: "dev@test.com",
  });
}

/** Token con rol client para tests de endpoints de usuario */
export function clientToken(): string {
  return signToken({
    id: "test-client-id",
    role: "client",
    email: "client@test.com",
  });
}

export function roleTargetToken(
  role: "client" | "barber" | "admin" = "client",
) {
  return signToken({
    id: "test-role-target-id",
    role,
    email: "role-target@test.com",
  });
}
