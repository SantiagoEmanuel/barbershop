# Modelo de roles y permisos

El backend usa RBAC: un usuario tiene un rol y cada rol agrupa permisos. Las rutas autorizan por permiso, no por el texto del rol. Esto permite cambiar la composición de un rol sin modificar todos los endpoints.

## Roles

| Rol      | Alcance                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client` | Crear y consultar sus propios turnos, cancelar los propios, consultar catálogos y crear órdenes del flujo de cliente.                                                                      |
| `barber` | Permisos de cliente, sobre turnos y registrar ventas de mostrador. No puede consultar finanzas, reportes ni administrar catálogos.                                                         |
| `admin`  | Gestión operativa completa: usuarios, barberos, horarios, catálogos, órdenes, inventario, finanzas y reportes.                                                                             |
| `dev`    | Todos los permisos operativos y los permisos `development:*`. Debe asignarse únicamente por un procedimiento privado y auditado; el registro público nunca permite crear un usuario `dev`. |

## Permisos principales

| Área       | Permisos                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Usuarios   | `users:read`, `users:manage`                                                                                                                           |
| Turnos     | `appointments:create`, `appointments:read:own`, `appointments:read:any`, `appointments:update:own`, `appointments:update:any`, `appointments:overbook` |
| Barberos   | `barbers:read`, `barbers:manage`, `barber-schedules:manage`                                                                                            |
| Catálogo   | `catalog:read`, `catalog:manage`, `payment-methods:read`, `payment-methods:manage`                                                                     |
| Órdenes    | `orders:create`, `orders:read`, `orders:update`, `sales:create`                                                                                        |
| Inventario | `inventory:read`, `inventory:manage`                                                                                                                   |
| Finanzas   | `finance:manage`, `reports:read`                                                                                                                       |
| Desarrollo | `development:access`, `development:debug`                                                                                                              |

La matriz ejecutable está en [`permissions.ts`](../../apps/server/src/middleware/permissions.ts). Las rutas usan [`permissions.middleware.ts`](../../apps/server/src/middleware/permissions.middleware.ts), con `requirePermission` para exigir todos los permisos indicados y `requireAnyPermission` para permitir una de varias capacidades.

## Endpoints de autorización

Todos requieren cookie `auth_token`, salvo que se indique lo contrario:

| Método  | Ruta                          | Permiso        | Función                                                  |
| ------- | ----------------------------- | -------------- | -------------------------------------------------------- |
| `GET`   | `/api/v1/auth/me`             | autenticación  | Devuelve el usuario actual y sus permisos efectivos.     |
| `GET`   | `/api/v1/auth/permissions`    | autenticación  | Devuelve rol y permisos efectivos para la UI.            |
| `GET`   | `/api/v1/auth/roles`          | `users:manage` | Devuelve la matriz de roles y permisos.                  |
| `PATCH` | `/api/v1/auth/users/:id/role` | `users:manage` | Cambia el rol de otro usuario. Body: `{ "role": "client" | "barber" | "admin" | "dev" }`. |

El cambio de rol valida el valor recibido en runtime, impide cambiar el propio rol, invalida los JWT anteriores mediante la comprobación de rol contra la base, protege al último administrador y reserva la administración de `dev` para otro usuario `dev`.

## Reglas de seguridad

- El JWT solo transporta identidad y rol; el backend vuelve a consultar el usuario activo y compara email y rol.
- Cambiar el rol invalida los tokens anteriores porque dejan de coincidir con el usuario almacenado.
- El frontend puede ocultar navegación, pero nunca concede acceso. La autorización real ocurre en el backend.
- El frontend sincroniza la sesión mediante `GET /api/v1/auth/me`, filtra el menú con los permisos recibidos y protege cada ruta del panel con un guard de permisos. Si el backend rechaza el token o cambia el rol, el backend continúa siendo la autoridad.
- No debe crearse un endpoint público para promover a `admin` o `dev`.
- Las operaciones sobre recursos concretos todavía deben validar propiedad y relación de datos; tener un permiso de área no autoriza automáticamente cualquier `id` recibido.
- Si en el futuro se requieren permisos personalizados por usuario, conviene migrar a tablas `roles`, `permissions` y `role_permissions` o `user_permissions`, con auditoría de cambios. No se debe introducir una lista de permisos enviada por el cliente.
