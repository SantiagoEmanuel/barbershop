import { Outlet } from "react-router";
import { AuthModalProvider } from "../provider/authModalProvider";

/**
 * Layout raíz absoluto.
 *
 * Envuelve TODA la app en AuthModalProvider, así el modal de auth, el toaster
 * y el contexto están disponibles tanto en el sitio público como en /admin/*.
 * No agrega navbar/footer — eso lo hacen los layouts hijos (PublicLayout,
 * AdminLayout) según su contexto.
 */
export function RootLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
    </AuthModalProvider>
  );
}
