# Registro de bugs y observaciones

Registro acumulativo para problemas funcionales, regresiones, errores de operación y hallazgos de seguridad que todavía necesiten triage. Para un hallazgo confirmado de seguridad, completar también [`vulnerability-register.md`](./vulnerability-register.md).

## Convenciones

- `BUG-###`: defecto funcional, técnico u operativo.
- `SEC-###`: vulnerabilidad o debilidad de seguridad confirmada.
- `OBS-###`: observación pendiente de confirmar.
- Estados: `ABIERTO`, `EN_PROGRESO`, `PARCIAL`, `CORREGIDO`, `VERIFICADO`, `CERRADO`, `ACEPTADO`.
- La columna **próximo paso** debe ser concreta y tener un responsable cuando el registro salga de triage.

## Registro

| ID      | Categoría                         | Título                       | Severidad | Prioridad | Servicio | Estado  | Detectado  | Responsable | Próximo paso            |
| ------- | --------------------------------- | ---------------------------- | --------- | --------- | -------- | ------- | ---------- | ----------- | ----------------------- |
| BUG-___ | FUNCIONAL / SEGURIDAD / OPERACIÓN | Completar desde la plantilla | —         | —         | —        | ABIERTO | AAAA-MM-DD | —           | Reproducir y clasificar |

## Detalle de cada entrada

El resumen anterior debe apuntar a un reporte detallado creado a partir de [`report-template.md`](./report-template.md). No reemplazar una entrada existente: actualizar su estado y agregar la referencia a la corrección o a la validación.

### Registro de cambios

| Fecha      | ID      | Cambio                                 | Autor |
| ---------- | ------- | -------------------------------------- | ----- |
| AAAA-MM-DD | BUG-___ | Alta inicial / actualización de estado | —     |

## Criterios de triage

1. Confirmar si es reproducible y separar causa de síntoma.
2. Si existe bypass de autenticación/autorización, exposición de datos, fraude, inyección o impacto en producción, crear o vincular un `SEC-###`.
3. Asignar severidad y prioridad según [`README.md`](./README.md).
4. Registrar la prueba que evita la regresión antes de cerrar el bug.
