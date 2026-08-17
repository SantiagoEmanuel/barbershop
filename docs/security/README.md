# Gestión de vulnerabilidades y bugs

Esta carpeta contiene el registro operativo de seguridad del backend y una forma uniforme de documentar nuevos hallazgos. La auditoría técnica de referencia está en [`SECURITY_AUDIT.md`](../../SECURITY_AUDIT.md).

## Qué documento usar

- [`vulnerability-register.md`](./vulnerability-register.md): inventario de vulnerabilidades conocidas, su clasificación y estado.
- [`permissions-model.md`](./permissions-model.md): matriz de roles y permisos del backend.
- [`bug-register.md`](./bug-register.md): registro acumulativo de bugs funcionales, de seguridad y de operación.
- [`report-template.md`](./report-template.md): plantilla para crear un reporte reproducible y accionable.

## Flujo de trabajo

1. Copiar la plantilla y asignar un identificador único: `SEC-###` para una vulnerabilidad o `BUG-###` para un bug.
2. Confirmar el alcance: servicio, endpoint, archivo, entorno y versión o commit afectado.
3. Reproducir el problema con datos mínimos y adjuntar evidencia redactada.
4. Clasificar severidad y prioridad usando los criterios de esta página.
5. Registrar responsable, próximo paso y fecha objetivo.
6. Corregir con una prueba de regresión y actualizar el estado a `CORREGIDO`.
7. Validar en el entorno correspondiente y actualizar a `VERIFICADO` o `CERRADO`.

Los reportes de seguridad deben compartirse por un canal privado con el responsable del sistema. Nunca se deben incluir contraseñas, tokens JWT, cookies, claves API, credenciales de base de datos, datos personales reales ni dumps de producción en este repositorio.

## Severidad

| Nivel       | Criterio práctico                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Crítica** | Compromiso remoto amplio, ejecución de código, acceso directo a producción o exfiltración masiva de datos.                       |
| **Alta**    | Acceso no autorizado a datos o acciones relevantes, escalada de privilegios o fraude reproducible sin condiciones excepcionales. |
| **Media**   | Impacto acotado, exposición parcial, abuso que requiere condiciones adicionales o debilidad que facilita otro ataque.            |
| **Baja**    | Impacto limitado, principalmente defensivo, de configuración o con explotabilidad reducida.                                      |

La severidad describe el impacto técnico. Si se cuenta con un cálculo CVSS, documentarlo junto con el vector; no reemplaza la descripción del impacto real en este sistema.

## Prioridad

| Prioridad | Tiempo objetivo | Uso                                                                                                                            |
| --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **P0**    | Inmediato       | Riesgo crítico activo, explotación observada o exposición grave de producción. Contener antes de continuar con trabajo normal. |
| **P1**    | Próximo ciclo   | Vulnerabilidad alta o media con impacto directo en autenticación, autorización, pagos, reservas o datos personales.            |
| **P2**    | Planificado     | Corrección importante, pero sin indicios de explotación activa ni impacto inmediato amplio.                                    |
| **P3**    | Backlog         | Mejora defensiva, higiene técnica o riesgo de impacto bajo.                                                                    |

La prioridad puede ser superior a la severidad cuando el área afectada es especialmente sensible, por ejemplo pagos o datos personales.

## Estados permitidos

`ABIERTO` → `EN_PROGRESO` → `CORREGIDO` → `VERIFICADO` → `CERRADO`

También se puede usar `PARCIAL` cuando solo se corrigió una parte del hallazgo y `ACEPTADO` cuando existe una decisión explícita de asumir el riesgo, con responsable y fecha de revisión.

## Reglas de calidad

Un reporte debe permitir que otra persona reproduzca el problema sin pedir contexto adicional. Debe separar claramente el resultado esperado del resultado observado, identificar el control que falló y explicar qué datos o acciones quedan expuestos.

Para una vulnerabilidad, además:

- probar únicamente en entornos autorizados;
- minimizar el impacto y detenerse al demostrar el acceso o la condición vulnerable;
- redactar secretos y datos personales de la evidencia;
- no publicar detalles de explotación mientras el riesgo siga abierto;
- conservar la evidencia sensible fuera del repositorio, con acceso restringido.
