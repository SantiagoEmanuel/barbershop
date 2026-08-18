# Política de seguridad

## Reportar una vulnerabilidad

No publiques vulnerabilidades en issues, pull requests ni canales públicos. Reporta el hallazgo por el canal privado acordado con el responsable del proyecto y adjunta un reporte basado en [`docs/security/report-template.md`](docs/security/report-template.md).

El reporte debe incluir:

- impacto y alcance;
- servicio, endpoint, archivo y versión afectados;
- pasos mínimos para reproducirlo;
- evidencia redactada;
- severidad y prioridad sugeridas;
- mitigación o corrección propuesta, si se conoce.

Si el problema expone credenciales, tokens, cookies, claves API o datos personales, no los copies al repositorio. Revoca o rota los secretos comprometidos y comunica el incidente por el canal privado.

## Gestión interna

El inventario actual está en [`docs/security/vulnerability-register.md`](docs/security/vulnerability-register.md). Los bugs funcionales y operativos se registran en [`docs/security/bug-register.md`](docs/security/bug-register.md). El procedimiento de clasificación, estados y tiempos objetivo está en [`docs/security/README.md`](docs/security/README.md).

La auditoría de referencia es [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md). Sus conclusiones son de revisión estática del código y no prueban por sí mismas la seguridad de la infraestructura o de una base de datos productiva.

## Alcance de las pruebas

Solo se permite probar contra entornos y cuentas autorizados. No realizar extracción masiva de datos, denegación de servicio, persistencia, movimiento lateral ni acciones que alteren producción más allá de lo imprescindible para demostrar el problema.
