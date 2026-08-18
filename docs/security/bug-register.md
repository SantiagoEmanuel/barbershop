# Registro de bugs y observaciones

Registro acumulativo para problemas funcionales, regresiones, errores de operación y hallazgos de seguridad que todavía necesiten triage. Para un hallazgo confirmado de seguridad, completar también [`vulnerability-register.md`](./vulnerability-register.md).

## Convenciones

- `BUG-###`: defecto funcional, técnico u operativo.
- `SEC-###`: vulnerabilidad o debilidad de seguridad confirmada.
- `OBS-###`: observación pendiente de confirmar.
- Estados: `ABIERTO`, `EN_PROGRESO`, `PARCIAL`, `CORREGIDO`, `VERIFICADO`, `CERRADO`, `ACEPTADO`.
- La columna **próximo paso** debe ser concreta y tener un responsable cuando el registro salga de triage.

## Registro

| ID      | Categoría | Título                                                              | Severidad | Prioridad | Servicio | Estado     | Detectado  | Responsable | Próximo paso                        |
| ------- | --------- | ------------------------------------------------------------------- | --------- | --------- | -------- | ---------- | ---------- | ----------- | ----------------------------------- |
| BUG-002 | FUNCIONAL | Las reservas sin email eran rechazadas aunque el email era opcional | Media     | P2        | Reservas | VERIFICADO | 2026-08-18 | Equipo web  | Mantener regresión para email vacío |

## Detalle de cada entrada

El resumen anterior debe apuntar a un reporte detallado creado a partir de [`report-template.md`](./report-template.md). No reemplazar una entrada existente: actualizar su estado y agregar la referencia a la corrección o a la validación.

### Registro de cambios

| Fecha      | ID      | Cambio                                                | Autor      |
| ---------- | ------- | ----------------------------------------------------- | ---------- |
| 2026-08-18 | BUG-002 | Alta, corrección y verificación de reservas sin email | Equipo web |

### BUG-002 — Las reservas sin email eran rechazadas aunque el email era opcional

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Reservas
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Media / P2
- **Precondición:** crear una reserva dejando vacío el email del cliente.
- **Causa:** el frontend enviaba una cadena vacía y un campo obsoleto (`paymentMethodId`), mientras el esquema estricto esperaba un email válido u omitido.
- **Corrección:** se normaliza el email vacío a `null`, se permite `null` en el esquema y se elimina el campo no aceptado por el endpoint.
- **Prueba de regresión:** `appointment.test.ts` confirma que la validación del email pasa y que el flujo continúa hasta validar el barbero.
- **Evidencia:** [`apps/server/src/v1/appointments/controller/appointment.ts`](../../apps/server/src/v1/appointments/controller/appointment.ts) y [`apps/web/src/components/bookingModal.tsx`](../../apps/web/src/components/bookingModal.tsx).

## Criterios de triage

1. Confirmar si es reproducible y separar causa de síntoma.
2. Si existe bypass de autenticación/autorización, exposición de datos, fraude, inyección o impacto en producción, crear o vincular un `SEC-###`.
3. Asignar severidad y prioridad según [`README.md`](./README.md).
4. Registrar la prueba que evita la regresión antes de cerrar el bug.
