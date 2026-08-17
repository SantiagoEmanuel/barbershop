# Auditoría de seguridad

Fecha: 2026-08-17
Alcance: revisión estática del backend, frontend, esquema de datos, configuración y pruebas del repositorio.

## Resumen ejecutivo

El proyecto tiene una base de seguridad razonable, pero no debe considerarse todavía un backend completamente seguro. La autenticación mejoró: los tokens se validan criptográficamente, se contrastan con el usuario activo de la base y las rutas administrativas exigen el rol correspondiente.

No encontré evidencia de:

- consultas SQL construidas concatenando entradas del usuario;
- secretos de producción versionados en Git;
- un endpoint que entregue directamente `TURSO_TOKEN`;
- una ruta pública que liste toda la base de datos.

Sí encontré riesgos pendientes que pueden producir:

- reservas fuera de horario o con estados manipulados;
- bloqueo o alteración de órdenes;
- cierre de turnos pertenecientes a otro barbero;
- exposición de datos personales mediante el endpoint público de confirmación;
- abuso del envío de correos;
- acceso directo a la base si se filtra el token de Turso o se compromete el servidor.

Conclusión: un atacante remoto no parece poder conectarse directamente a Turso únicamente usando la API pública actual, siempre que `TURSO_TOKEN` permanezca secreto y la base no esté expuesta públicamente. Sin embargo, la API todavía puede filtrar datos personales en casos concretos y un atacante con una sesión administrativa, el token de Turso o control del servidor podría leer o modificar la base.

## Escala utilizada

- **Crítica**: compromiso amplio o exfiltración masiva probable.
- **Alta**: impacto importante en cuentas, datos o dinero, con explotación relativamente accesible.
- **Media**: impacto limitado, abuso de lógica de negocio o explotación con condiciones adicionales.
- **Baja**: defensa en profundidad, privacidad limitada o impacto operativo.

Prioridades: **P0** inmediata, **P1** antes del próximo despliegue, **P2** próxima iteración, **P3** mejora planificada.

## Estado completado

### Autenticación y sesiones

- `verifyToken` valida la firma y estructura básica del JWT.
- El usuario se consulta nuevamente en DB y debe existir, estar activo y conservar email y rol compatibles con el token. Ver [auth.middleware.ts](apps/server/src/middleware/auth.middleware.ts#L39).
- La autenticación opcional se aplica solo a rutas concretas mediante `optionalToken`; ya no se ejecuta una consulta de autenticación global en todas las peticiones.
- Las rutas protegidas siguen una combinación explícita de `verifyToken` y `verifyRole`.
- Login y restauración de sesión rechazan usuarios inactivos. Ver [auth.ts](apps/server/src/v1/auth/controller/auth.ts#L19) y [auth.ts](apps/server/src/v1/auth/controller/auth.ts#L176).
- Las cookies de sesión son `httpOnly`, `secure` en producción y `SameSite=Lax`.

### Protección de la API

- CORS usa una lista de orígenes configurada por entorno.
- Helmet activa HSTS en producción, `frameguard`, `noSniff` y oculta la tecnología del servidor. Ver [config.ts](apps/server/src/config.ts#L14).
- Existe limitación general, de autenticación y de reservas. Login y registro aplican el limitador directamente sobre las rutas reales. Ver [auth/route.ts](apps/server/src/v1/auth/route.ts#L8).
- Las rutas de reportes, gastos, compras, inventario, servicios y administración requieren rol administrativo.
- Las transacciones de ventas y stock usan operaciones atómicas y el backend calcula el importe de la venta de mostrador. Ver [order.ts](apps/server/src/v1/orders/model/order.ts#L120).

### Base de datos y secretos

- Las consultas observadas usan Drizzle y parámetros, no concatenación de SQL.
- Las claves de producción están fuera del control de versiones según `.gitignore`; el archivo de pruebas contiene credenciales de prueba aisladas.
- Las relaciones importantes tienen claves foráneas e índices.
- Los tests de autenticación y autorización validan tokens contra usuarios de la base de pruebas.

## Hallazgos pendientes

| ID | Gravedad | Prioridad | Servicio| Hallazgo | Impacto|| ------ | -------- | --------: | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| SEC-01 | Alta | P1 | Reservas | El cliente puede enviar `status` al crear un turno y el backend lo persiste sin imponer `pending`. Además, se comprueba que exista algún slot ese día, pero no que el `startTime` solicitado sea un slot válido. Ver [appointment.ts](apps/server/src/v1/appointments/controller/appointment.ts#L9). | Puede crear reservas confirmadas/completadas o fuera de horario y contaminar la agenda y los reportes. |
| SEC-02 | Alta | P1 | Órdenes/Pagos | `POST /order` requiere cualquier JWT válido, no un rol ni la propiedad del turno. Acepta `appointmentId` y `amount` enviados por el cliente y crea órdenes pendientes. Ver [orders/route.ts](apps/server/src/v1/orders/route.ts#L28) y [order.ts](apps/server/src/v1/orders/model/order.ts#L56). | Un cliente puede generar órdenes arbitrarias, bloquear el turno con la restricción única o llenar la base con órdenes pendientes. |
| SEC-03 | Alta | P1 | Órdenes/Comisiones | En una venta de mostrador, un barbero solo se valida contra `soldBy`; no se verifica que el turno asociado pertenezca a ese barbero. Ver [order.ts](apps/server/src/v1/orders/model/order.ts#L131). | Un barbero autenticado podría cerrar un turno de otro barbero y atribuirse la venta. |
| SEC-04 | Media | P1 | Reservas/Privacidad | `PATCH /appointments/:id/confirm` es público y usa el UUID como único secreto de capacidad. La respuesta contiene nombre, teléfono, email, notas y relaciones del turno. Ver [appointments/route.ts](apps/server/src/v1/appointments/route.ts#L11) y [appointment.ts](apps/server/src/v1/appointments/model/appointment.ts#L41). | Si el UUID se filtra por correo, logs, historial o analítica, puede confirmarse el turno y obtenerse PII. |
| SEC-05 | Media | P2 | Email/Reservas | El email del cliente no se valida con un esquema estricto y el nombre del cliente se inserta sin escape en plantillas HTML. Ver [appointment.ts](apps/server/src/v1/appointments/controller/appointment.ts#L53) y [sendMail.ts](apps/server/src/utils/sendMail.ts#L217). | Abuso del dominio remitente, phishing en correos y posible inyección de HTML en clientes de correo. |
| SEC-06 | Media | P2 | Auth/Email | El token de confirmación de correo no define expiración, propósito ni audiencia, y la cuenta se actualiza antes de verificar completamente la correspondencia del email. Ver [sendMail.ts](apps/server/src/utils/sendMail.ts#L91) y [auth.ts](apps/server/src/v1/auth/controller/auth.ts#L95). | Un enlace filtrado puede reutilizarse indefinidamente y el flujo de verificación tiene una mutación previa a la validación completa. |
| SEC-07 | Media | P2 | Validación | Los tipos TypeScript no son validación de runtime. Hay múltiples `req.body as ...` y varios campos sin límites de tamaño, formato o rango. Los `enum` de Drizzle tampoco sustituyen necesariamente constraints `CHECK` en SQLite. | Entradas malformadas, estados inválidos, errores de DB, crecimiento de datos y abuso de lógica. |
| SEC-08 | Media | P2 | Errores/Observabilidad | Varios controladores devuelven directamente `err.message`, que puede incluir mensajes de DB o detalles internos. Ver [error.middleware.ts](apps/server/src/middleware/error.middleware.ts#L3). | Revelación de información útil para reconocimiento o explotación. |
| SEC-09 | Baja | P2 | Auth | Login diferencia usuario inexistente de contraseña incorrecta y el flujo de confirmación no se aplica como requisito para iniciar sesión. Ver [auth.ts](apps/server/src/v1/auth/model/auth.ts#L52) y [auth.ts](apps/server/src/v1/auth/controller/auth.ts#L19). | Enumeración de cuentas y registro de cuentas no verificadas según la regla de negocio. |
| SEC-10 | Baja | P3 | Plataforma | CSP está deshabilitada y no se observa configuración explícita de `trust proxy` ni un store distribuido para rate limiting. Ver [config.ts](apps/server/src/config.ts#L14) y [ratelimiter.middleware.ts](apps/server/src/middleware/ratelimiter.middleware.ts#L1). | Menor defensa ante XSS y límites inconsistentes detrás de proxy o con varias réplicas. |

## Riesgo específico de filtración de la DB

### Acceso directo a la base

La aplicación crea la conexión Turso exclusivamente en el servidor usando `TURSO_URL` y `TURSO_TOKEN`; el frontend no debería recibir esas variables. Ver [db.ts](apps/server/src/db/db.ts#L20).

Por tanto, un visitante normal no debería poder abrir directamente una conexión a Turso solo llamando endpoints públicos. El riesgo directo aparece si ocurre cualquiera de estas situaciones:

1. `TURSO_TOKEN` se filtra en logs, variables de CI/CD, imágenes Docker, backups, repositorios, paneles de hosting o errores operativos.
2. El servidor Node, el proceso de despliegue o una dependencia queda comprometida.
3. El proveedor de DB permite acceso público y las credenciales tienen permisos excesivos.
4. Un administrador o una cuenta con privilegios es comprometida.

En cualquiera de esos escenarios, el alcance real depende de los permisos del token: podría ser lectura, escritura o administración. El repositorio no permite verificar los permisos configurados en Turso ni sus reglas de red, backups, auditoría o rotación.

### Extracción indirecta a través de la API

Aunque no se obtenga el token de DB, la API puede devolver datos mediante:

- confirmación pública de turnos con un UUID conocido;
- sesión administrativa comprometida;
- abuso de endpoints que devuelven relaciones completas de usuarios, turnos, órdenes o reportes;
- errores que revelen información interna.

Esto no equivale a una lectura arbitraria de toda la DB, pero sí puede ser una filtración de PII o información financiera.

## Plan recomendado

### Antes del próximo despliegue — P1

1. Crear schemas Zod de runtime para reservas, órdenes, autenticación, gastos, compras y parámetros de fecha/hora.
2. Eliminar `status` del body de una reserva pública; el backend debe establecer siempre `pending`.
3. Validar que el turno solicitado pertenezca a los slots disponibles, que fecha/hora sean válidas y que barbero/servicio estén activos.
4. Restringir `POST /order` a los roles necesarios y comprobar propiedad, estado y asociación del turno.
5. Verificar que un barbero solo pueda cerrar turnos de su propio perfil, salvo una operación administrativa explícita.
6. Cambiar la confirmación pública a un token aleatorio, de un solo uso, con expiración y almacenado de forma hasheada; devolver solo los datos mínimos necesarios.
7. Escapar todo contenido dinámico en HTML de email y validar destinatarios.

### Próxima iteración — P2

1. Añadir expiración, propósito y audiencia diferenciados al token de confirmación de email.
2. Usar respuestas genéricas para login y un error público genérico para excepciones internas.
3. Añadir constraints DB para estados, cantidades, precios y relaciones mutuamente excluyentes.
4. Validar en producción `JWT_SECRET` con longitud/entropía mínima y `HASH_SALT` dentro de un rango seguro; abortar el arranque si faltan secretos críticos.
5. Revisar la política de CSRF para todas las operaciones mutantes autenticadas con cookies.
6. Configurar correctamente `trust proxy` solo para proxies controlados y usar un store distribuido para rate limiting si hay varias instancias.
7. Ejecutar `pnpm audit --prod` en CI y fijar versiones vulnerables con revisión de lockfile.

### Operación y protección de Turso — P1/P2

- Rotar inmediatamente `TURSO_TOKEN` si alguna vez apareció en logs, chats, capturas, CI o repositorios.
- Usar un token con el mínimo permiso necesario para la aplicación.
- Mantener tokens separados para desarrollo, pruebas, staging y producción.
- Activar MFA en cuentas de proveedor y restringir quién puede crear, rotar o leer tokens.
- Revisar cifrado, backups, retención, auditoría y alertas del proveedor.
- No imprimir variables de entorno ni objetos completos de error en logs.
- Preparar un procedimiento de revocación de sesiones, rotación de JWT y respuesta ante filtración.

## Verificación realizada

- Type-check del servidor: correcto.
- Tests enfocados de autenticación, autorización y endpoints públicos: correctos.
- Se añadió una regresión que comprueba que un JWT inválido devuelve `401`, no `500`.
- La auditoría fue estática; no se probaron credenciales reales, Turso de producción, infraestructura, DNS, WAF, backups ni configuraciones del proveedor.

La ausencia de una vulnerabilidad visible en el código no demuestra que la infraestructura de producción esté protegida. Para afirmar que la base no puede filtrarse habría que auditar también el despliegue, permisos del token de Turso, controles del proveedor, logs, backups y gestión de secretos.
