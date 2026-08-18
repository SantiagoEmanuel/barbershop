import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";
import { api } from "../lib/api";
import { AuthModalProvider } from "../provider/authModalProvider";
import { useAuthStore } from "../store/useAuthStore";
import type { ApiResponse, User } from "../types";
import { UpdatePrompt } from "./updatePrompt";

/**
 * Layout raíz absoluto.
 *
 * Envuelve TODA la app en AuthModalProvider, así el modal de auth, el toaster
 * y el contexto están disponibles tanto en el sitio público como en /admin/*.
 * No agrega navbar/footer — eso lo hacen los layouts hijos (PublicLayout,
 * AdminLayout) según su contexto.
 */
export function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!useAuthStore.getState().user) return;

    let cancelled = false;

    void api<ApiResponse<User>>("auth/me").then((response) => {
      if (!cancelled && response?.data) {
        void setUser(response.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return (
    <AuthModalProvider>
      <Outlet />
      <Toaster />
      <UpdatePrompt />
      <Analytics />
      <SpeedInsights />
    </AuthModalProvider>
  );
}
