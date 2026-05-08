import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

/**
 * AdminGuard
 *
 * Verifica solo con el store de Zustand (rehidratado desde localStorage).
 * Razón: el backend ya protege cada endpoint con verifyToken + verifyRole("admin").
 * Un check extra al backend en cada render del guard es costoso sin ganancia real
 * de seguridad — si alguien bypasea el guard, igual recibe 401/403 en cada request.
 * La única superficie real de ataque es la UI, que no expone datos sensibles
 * sin una respuesta válida del backend.
 */
export default function AdminGuard() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
