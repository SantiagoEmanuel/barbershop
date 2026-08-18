# Registro de bugs y observaciones

Registro acumulativo para problemas funcionales, regresiones, errores de operación y hallazgos de seguridad que todavía necesiten triage. Para un hallazgo confirmado de seguridad, completar también [`vulnerability-register.md`](./vulnerability-register.md).

## Convenciones

- `BUG-###`: defecto funcional, técnico u operativo.
- `SEC-###`: vulnerabilidad o debilidad de seguridad confirmada.
- `OBS-###`: observación pendiente de confirmar.
- Estados: `ABIERTO`, `EN_PROGRESO`, `PARCIAL`, `CORREGIDO`, `VERIFICADO`, `CERRADO`, `ACEPTADO`.
- La columna **próximo paso** debe ser concreta y tener un responsable cuando el registro salga de triage.

## Registro

| ID      | Categoría | Título                                                                           | Severidad | Prioridad | Servicio | Estado     | Detectado  | Responsable    | Próximo paso                                                   |
| ------- | --------- | -------------------------------------------------------------------------------- | --------- | --------- | -------- | ---------- | ---------- | -------------- | -------------------------------------------------------------- |
| BUG-003 | FUNCIONAL | `cash-online` estaba declarado en el esquema pero no en todos los flujos de pago | Media     | P2        | Pagos    | VERIFICADO | 2026-08-18 | Equipo backend | Mantener la lista de tipos sincronizada entre schema, API y UI |

## Detalle de cada entrada

El resumen anterior debe apuntar a un reporte detallado creado a partir de [`report-template.md`](./report-template.md). No reemplazar una entrada existente: actualizar su estado y agregar la referencia a la corrección o a la validación.

### Registro de cambios

| Fecha      | ID      | Cambio                                           | Autor          |
| ---------- | ------- | ------------------------------------------------ | -------------- |
| 2026-08-18 | BUG-003 | Alta, corrección y verificación de `cash-online` | Equipo backend |

### BUG-003 — `cash-online` estaba declarado en el esquema pero no en todos los flujos de pago

- **Tipo:** `BUG`
- **Fecha de descubrimiento:** `2026-08-18`
- **Servicio o módulo:** Pagos
- **Entorno:** desarrollo
- **Estado:** `VERIFICADO`
- **Severidad / prioridad:** Media / P2
- **Precondición:** usar un método de pago de tipo `cash-online` creado o persistido en la base.
- **Causa:** el esquema y el listado general conocían el nuevo tipo, pero la creación de métodos, la consulta por ID, los tipos de TypeScript y la validación de órdenes seguían limitados a `cash` y `card`.
- **Corrección:** se sincronizaron los tipos permitidos en schema, controlador, modelo, órdenes y frontend.
- **Prueba de regresión:** type-check del servidor y frontend, suite del servidor y revisión de los flujos de listado, consulta y creación.
- **Evidencia:** [`apps/server/src/v1/payment-methods/controller/paymentMethod.ts`](../../apps/server/src/v1/payment-methods/controller/paymentMethod.ts), [`apps/server/src/v1/payment-methods/model/paymentMethod.ts`](../../apps/server/src/v1/payment-methods/model/paymentMethod.ts) y [`apps/server/src/v1/orders/model/order.ts`](../../apps/server/src/v1/orders/model/order.ts).

## Criterios de triage

1. Confirmar si es reproducible y separar causa de síntoma.
2. Si existe bypass de autenticación/autorización, exposición de datos, fraude, inyección o impacto en producción, crear o vincular un `SEC-###`.
3. Asignar severidad y prioridad según [`README.md`](./README.md).
4. Registrar la prueba que evita la regresión antes de cerrar el bug.
