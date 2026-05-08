/**
 * Barrel de tipos del frontend.
 *
 * Convención: importar siempre desde `@/types` (o ruta relativa al barrel),
 * nunca desde el archivo de dominio directo. Eso permite refactorizar
 * archivos internos sin romper imports.
 */
export * from "./api";
export * from "./appointment";
export * from "./barber";
export * from "./booking";
export * from "./nav";
export * from "./order";
export * from "./product";
export * from "./service";
export * from "./user";
