# Tests del backend

## Stack

- **Vitest** — runner de tests (configurado en `vitest.config.ts`)
- **Supertest** — realiza peticiones HTTP contra la app Express sin levantar el servidor
- **JWT helper** — genera tokens firmados para simular autenticación en tests

## Cómo correr los tests

```bash
# Desde la raíz del monorepo
pnpm --filter server test

# Solo un archivo específico
pnpm --filter server test -- --run src/v1/test/endpoints/barber.test.ts

# En modo watch (re-ejecuta al guardar)
pnpm --filter server test
```

## Estructura

```text
src/v1/test/
├── helpers.ts                    # Utilidades: generación de JWT para admin/client
├── README.md                     # Este archivo
└── endpoints/
    ├── health.test.ts            # GET /status y rutas 404
    ├── auth.test.ts              # Login, registro, logout, restore-session
    ├── barber.test.ts            # CRUD de barberos (endpoints públicos)
    ├── service.test.ts           # CRUD de servicios (endpoints públicos)
    ├── availability.test.ts      # Consulta de turnos disponibles
    ├── appointment.test.ts       # Creación y consulta de turnos
    ├── paymentMethod.test.ts     # Métodos de pago
    ├── product.test.ts           # Productos
    ├── order.test.ts             # Órdenes (admin)
    ├── report.test.ts            # Reportes financieros (admin)
    └── protected.test.ts         # Verificación masiva de auth/roles en endpoints protegidos
```

## Cómo funcionan

### Conexión a la base de datos

Los tests importan la app Express directamente (`import app from "@/config"`) y supertest envía requests sin levantar un servidor HTTP real. **Se usa la base de datos real** (Turso via `.env.dev`), por lo que:

- Los tests GET son seguros y no modifican datos.
- Los tests POST de validación envían datos inválidos/incompletos para probar que el backend los rechaza sin crear registros.
- No se hacen tests destructivos (DELETE, PUT) que alteren datos existentes.

### Autenticación en tests

El archivo `helpers.ts` expone funciones para generar JWTs válidos:

```ts
import { adminToken, clientToken } from "../helpers";

// Usar como cookie en supertest
request(app)
  .get("/api/v1/appointments")
  .set("Cookie", `auth_token=${adminToken()}`);
```

- `adminToken()` — JWT con `role: "admin"` (accede a todo)
- `clientToken()` — JWT con `role: "client"` (acceso limitado)

Los tokens se firman con el `JWT_SECRET` real del `.env.dev`, así que el middleware `verifyToken` los acepta.

### Qué se testea

| Archivo                 | Qué cubre                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `health.test.ts`        | Health check (`/status` → 200) y rutas inexistentes (→ 404)                                                                     |
| `auth.test.ts`          | Login sin credenciales (→ 400+), registro con datos duplicados (→ 400+), logout (→ 200), restore-session sin cookie (→ 401/404) |
| `barber.test.ts`        | Listado público de barberos, búsqueda por slug, 404 para slug inexistente                                                       |
| `service.test.ts`       | Listado público de servicios, búsqueda por ID, 404 para ID inexistente                                                          |
| `availability.test.ts`  | Slots disponibles con barbero/fecha válidos, 400 si faltan parámetros                                                           |
| `appointment.test.ts`   | Creación sin datos (→ 400+), listado admin (auth requerida), historial del usuario                                              |
| `paymentMethod.test.ts` | Listado público, búsqueda por ID                                                                                                |
| `product.test.ts`       | Listado público, búsqueda por ID, 404 para ID inexistente                                                                       |
| `order.test.ts`         | Listado admin, búsqueda por ID (404 para inexistente)                                                                           |
| `report.test.ts`        | Los 5 reportes financieros con token admin (summary, income, expenses, products, services)                                      |
| `protected.test.ts`     | Verificación masiva: 15+ endpoints protegidos devuelven 401 sin token, 403 con rol insuficiente, y 200 con token admin          |

### Agregar un test nuevo

1. Crear un archivo en `src/v1/test/endpoints/` con extensión `.test.ts`
2. Importar la app y supertest:

   ```ts
   import app from "@/config";
   import request from "supertest";
   import { describe, expect, it } from "vitest";
   ```

3. Para endpoints protegidos, importar los helpers de token:

   ```ts
   import { adminToken } from "../helpers";
   ```

4. Vitest lo detecta automáticamente — no hace falta registrarlo en ningún lado.
