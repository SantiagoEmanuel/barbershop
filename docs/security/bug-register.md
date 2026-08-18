# Registro de bugs y observaciones

Registro acumulativo para problemas funcionales, regresiones, errores de operación y hallazgos de seguridad que todavía necesiten triage. Para un hallazgo confirmado de seguridad, completar también [`vulnerability-register.md`](./vulnerability-register.md).

## Convenciones

- `BUG-###`: defecto funcional, técnico u operativo.
- `SEC-###`: vulnerabilidad o debilidad de seguridad confirmada.
- `OBS-###`: observación pendiente de confirmar.
- Estados: `ABIERTO`, `EN_PROGRESO`, `PARCIAL`, `CORREGIDO`, `VERIFICADO`, `CERRADO`, `ACEPTADO`.
- La columna **próximo paso** debe ser concreta y tener un responsable cuando el registro salga de triage.

## Registro

| ID      | Categoría | Título                                                              | Severidad | Prioridad | Servicio         | Estado     | Detectado  | Responsable    | Próximo paso                                                 |
| ------- | --------- | ------------------------------------------------------------------- | --------- | --------- | ---------------- | ---------- | ---------- | -------------- | ------------------------------------------------------------ |
| BUG-001 | FUNCIONAL | Las ventas desde un turno no vinculaban la orden al turno           | Alta      | P1        | Ventas / Órdenes | VERIFICADO | 2026-08-18 | Equipo web     | Mantener pruebas de vínculo para turno regular y sobre turno |
| BUG-002 | FUNCIONAL | Las reservas sin email eran rechazadas aunque el email era opcional | Media     | P2        | Reservas         | VERIFICADO | 2026-08-18 | Equipo web     | Mantener regresión para email vacío                          |
| BUG-003 | FUNCIONAL | `cash-online` no estaba soportado en todos los flujos de pago       | Media     | P2        | Pagos            | VERIFICADO | 2026-08-18 | Equipo backend | Mantener sincronizada la lista de tipos entre capas          |

## Detalle de cada entrada

El resumen anterior debe apuntar a un reporte detallado creado a partir de [`report-template.md`](./report-template.md). No reemplazar una entrada existente: actualizar su estado y agregar la referencia a la corrección o a la validación.

### Registro de cambios

| Fecha      | ID      | Cambio                                                           | Autor          |
| ---------- | ------- | ---------------------------------------------------------------- | -------------- |
| 2026-08-18 | BUG-001 | Alta, corrección y verificación del vínculo de órdenes de ventas | Equipo web     |
| 2026-08-18 | BUG-002 | Alta, corrección y verificación de reservas sin email            | Equipo web     |
| 2026-08-18 | BUG-003 | Alta, corrección y verificación de `cash-online`                 | Equipo backend |

### BUG-001 — Las ventas desde un turno no vinculaban la orden al turno

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Ventas / Órdenes
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Alta / P1
- **Causa:** el frontend construía propiedades como `regular: "regular"` o `extraordinary: "extraordinary"` en lugar de enviar `appointmentId`/`overbookedAppointmentId`.
- **Corrección:** se conserva el turno seleccionado y se construye el vínculo con el ID y la clave correspondiente al tipo de turno. Un cobro iniciado desde un turno no puede degradarse silenciosamente a una venta libre.
- **Prueba de regresión:** type-check y lint del frontend, suite del servidor y revisión del payload para ambos tipos de turno.
- **Pull request:** https://github.com/SantiagoEmanuel/barbershop/pull/64
- **Commit de corrección:** `a472c26`

### BUG-002 — Las reservas sin email eran rechazadas aunque el email era opcional

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Reservas
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Media / P2
- **Causa:** el frontend enviaba una cadena vacía y un campo obsoleto (`paymentMethodId`), mientras el esquema estricto esperaba un email válido u omitido.
- **Corrección:** se normaliza el email vacío a `null`, se permite `null` en el esquema y se elimina el campo no aceptado por el endpoint.
- **Prueba de regresión:** `appointment.test.ts` confirma que la validación del email pasa y que el flujo continúa hasta validar el barbero.
- **Pull request:** https://github.com/SantiagoEmanuel/barbershop/pull/65
- **Commit de corrección:** `bb5abd9`

### BUG-003 — `cash-online` no estaba soportado en todos los flujos de pago

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Pagos
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Media / P2
- **Causa:** el esquema y el listado general conocían el nuevo tipo, pero la creación de métodos, la consulta por ID, los tipos de TypeScript y la validación de órdenes seguían limitados a `cash` y `card`.
- **Corrección:** se sincronizaron los tipos permitidos en schema, controlador, modelo, órdenes y frontend.
- **Prueba de regresión:** type-check del servidor y frontend, suite del servidor y revisión de los flujos de listado, consulta y creación.
- **Pull request:** https://github.com/SantiagoEmanuel/barbershop/pull/66
- **Commit de corrección:** `f921576`

## Criterios de triage

1. Confirmar si es reproducible y separar causa de síntoma.
2. Si existe bypass de autenticación/autorización, exposición de datos, fraude, inyección o impacto en producción, crear o vincular un `SEC-###`.
3. Asignar severidad y prioridad según [`README.md`](./README.md).
4. Registrar la prueba que evita la regresión antes de cerrar el bug.
