# Registro de bugs y observaciones

Registro acumulativo para problemas funcionales, regresiones, errores de operación y hallazgos de seguridad que todavía necesiten triage. Para un hallazgo confirmado de seguridad, completar también [`vulnerability-register.md`](./vulnerability-register.md).

## Convenciones

- `BUG-###`: defecto funcional, técnico u operativo.
- `SEC-###`: vulnerabilidad o debilidad de seguridad confirmada.
- `OBS-###`: observación pendiente de confirmar.
- Estados: `ABIERTO`, `EN_PROGRESO`, `PARCIAL`, `CORREGIDO`, `VERIFICADO`, `CERRADO`, `ACEPTADO`.
- La columna **próximo paso** debe ser concreta y tener un responsable cuando el registro salga de triage.

## Registro

| ID      | Categoría             | Título                                                    | Severidad | Prioridad | Servicio         | Estado     | Detectado  | Responsable | Próximo paso                                                 |
| ------- | --------------------- | --------------------------------------------------------- | --------- | --------- | ---------------- | ---------- | ---------- | ----------- | ------------------------------------------------------------ |
| BUG-001 | FUNCIONAL / OPERACIÓN | Las ventas desde un turno no vinculaban la orden al turno | Alta      | P1        | Ventas / Órdenes | VERIFICADO | 2026-08-18 | Equipo web  | Mantener pruebas de vínculo para turno regular y sobre turno |

## Detalle de cada entrada

El resumen anterior debe apuntar a un reporte detallado creado a partir de [`report-template.md`](./report-template.md). No reemplazar una entrada existente: actualizar su estado y agregar la referencia a la corrección o a la validación.

### Registro de cambios

| Fecha      | ID      | Cambio                                                           | Autor      |
| ---------- | ------- | ---------------------------------------------------------------- | ---------- |
| 2026-08-18 | BUG-001 | Alta, corrección y verificación del vínculo de órdenes de ventas | Equipo web |

### BUG-001 — Las ventas desde un turno no vinculaban la orden al turno

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Ventas / Órdenes
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Alta / P1
- **Precondición:** abrir `/admin/ventas/:appointmentId` o seleccionar un turno desde ventas.
- **Causa:** el frontend construía propiedades como `regular: "regular"` o `extraordinary: "extraordinary"` en lugar de enviar `appointmentId`/`overbookedAppointmentId`. Además, el turno cargado por URL no se conservaba como contexto para el envío.
- **Corrección:** se conserva el turno seleccionado y se construye el vínculo con el ID y la clave correspondiente al tipo de turno. Un cobro iniciado desde un turno no puede degradarse silenciosamente a una venta libre.
- **Prueba de regresión:** type-check y lint del frontend, suite del servidor y revisión del payload para ambos tipos de turno.
- **Evidencia:** [`apps/web/src/pages/ventas.tsx`](../../apps/web/src/pages/ventas.tsx) y [`apps/server/src/v1/orders/controller/order.ts`](../../apps/server/src/v1/orders/controller/order.ts).
- **Pull request:** https://github.com/SantiagoEmanuel/barbershop/pull/64
- **Commit de corrección:** `a472c26`

## Criterios de triage

1. Confirmar si es reproducible y separar causa de síntoma.
2. Si existe bypass de autenticación/autorización, exposición de datos, fraude, inyección o impacto en producción, crear o vincular un `SEC-###`.
3. Asignar severidad y prioridad según [`README.md`](./README.md).
4. Registrar la prueba que evita la regresión antes de cerrar el bug.
