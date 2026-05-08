/**
 * Forma estándar que devuelve el backend para responses con payload tipado.
 * Cualquier endpoint que devuelva data envuelta usa este shape.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
