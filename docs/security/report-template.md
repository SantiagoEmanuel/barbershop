# Plantilla de reporte de vulnerabilidad o bug

Copiar este archivo, completar los campos y guardar el reporte en el registro correspondiente. Usar `SEC-###` para vulnerabilidades y `BUG-###` para bugs.

## Identificación

- **ID:** `SEC-___` / `BUG-___`
- **Tipo:** `VULNERABILIDAD` / `BUG`
- **Fecha de descubrimiento:** `AAAA-MM-DD`
- **Reportado por:**
- **Título breve:**
- **Servicio o módulo:**
- **Entorno:** desarrollo / test / staging / producción
- **Versión, rama o commit:**
- **Endpoint, archivo o componente afectado:**
- **Estado:** `ABIERTO`

## Clasificación

- **Severidad:** crítica / alta / media / baja
- **Prioridad:** P0 / P1 / P2 / P3
- **CWE, OWASP u otra referencia:** opcional
- **¿Hay explotación observada?:** sí / no / desconocido
- **¿Hay datos personales, financieros o credenciales involucrados?:** sí / no / desconocido

## Descripción

### Precondiciones

Indicar cuenta, rol, permisos, configuración y estado de datos necesarios. No incluir credenciales reales.

### Pasos para reproducir

1.
2.
3.

### Resultado esperado

Describir el comportamiento seguro o correcto.

### Resultado observado

Describir exactamente qué sucede, incluyendo código HTTP, estado persistido y respuesta relevante.

### Impacto

Explicar qué puede hacer un atacante o usuario afectado, qué datos o procesos quedan comprometidos y cuál es el alcance.

### Evidencia redactada

Incluir requests/responses mínimas, logs, capturas o referencias a archivos. Redactar tokens, cookies, emails reales, IDs sensibles, secretos y datos de producción.

```text
Request/command sanitizado:

Respuesta o log sanitizado:
```

### Causa probable

Identificar el control ausente o incorrecto. Evitar limitarse a describir el síntoma.

## Corrección y seguimiento

- **Mitigación inmediata:**
- **Corrección propuesta:**
- **Responsable:**
- **Fecha objetivo:** `AAAA-MM-DD`
- **Prueba de regresión requerida:**
- **Pull request o commit de corrección:**
- **Fecha de corrección:**
- **Validado por:**
- **Fecha de validación:**
- **Resultado de la validación:**
- **Estado final:** `CORREGIDO` / `VERIFICADO` / `CERRADO` / `ACEPTADO`

## Reglas para reportes sensibles

No adjuntar secretos ni datos reales a este repositorio. Si la vulnerabilidad permite acceso a producción, detener la prueba, conservar solo evidencia mínima y comunicarla por el canal privado acordado. Rotar inmediatamente cualquier secreto que haya quedado expuesto.
