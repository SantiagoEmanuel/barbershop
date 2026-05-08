/**
 * @deprecated Mantenido como re-export por compatibilidad.
 * Importá `useServicesStore` desde `../store/useServicesStore` directamente.
 *
 * Antes acá vivía un store duplicado que rompía en runtime al hacer
 * `response.data` sin chequear null cuando la API fallaba.
 */
export { useServicesStore as useService } from "../store/useServicesStore";
