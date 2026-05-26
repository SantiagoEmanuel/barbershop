import type { RouteObject } from "react-router";
import { ErrorView } from "../components/errorView";
import { PublicLayout } from "../components/publicLayout";
import { RootLayout } from "../components/rootLayout";
import Home from "../pages/home";

/**
 * Estructura de rutas:
 *   RootLayout (provee AuthModalProvider + Toaster a toda la app)
 *     ├── PublicLayout (Navbar + Footer)
 *     │     ├── /          Home
 *     │     ├── /perfil
 *     │     └── /mis-turnos
 *     └── AdminGuard → AdminLayout (Navbar, sin footer)
 *           └── /admin/...  Dashboard, Turnos, etc.
 *
 * Home se importa de forma estática porque es la ruta que se pre-renderiza
 * para SEO. El resto (perfil, panel admin y la integración de pagos) se carga
 * de forma diferida: reduce el bundle inicial y evita importar el SDK de
 * MercadoPago durante el prerender en build.
 */

/** Helper: convierte un import con `default` en una ruta lazy de react-router. */
const lazy =
  <T extends { default: React.ComponentType }>(load: () => Promise<T>) =>
  async () => ({ Component: (await load()).default });

export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    ErrorBoundary: ErrorView,
    children: [
      // ── Rutas públicas ────────────────────────────────────
      {
        path: "/",
        Component: PublicLayout,
        children: [
          { index: true, Component: Home },
          { path: "perfil", lazy: lazy(() => import("../pages/profile")) },
          // Reutilizamos Perfil — ya tiene la sección de turnos
          { path: "mis-turnos", lazy: lazy(() => import("../pages/profile")) },
          { path: "confirm", lazy: lazy(() => import("../pages/confirm")) },
          {
            path: "payment-verification",
            lazy: lazy(() => import("../pages/paymentVerification")),
          },
          { path: "turno/confirmar/:appointmentId", lazy: () => import("../pages/confirmTurno") },
        ],
      },

      // ── Rutas de admin (protegidas) ───────────────────────
      {
        path: "/admin",
        lazy: lazy(() => import("../guard/adminGuard")),
        children: [
          {
            lazy: lazy(() => import("../components/adminLayout")),
            children: [
              { index: true, lazy: lazy(() => import("../pages/dashboard")) },
              { path: "turnos", lazy: lazy(() => import("../pages/shift")) },
              {
                path: "cierre/:appointmentId",
                lazy: lazy(() => import("../pages/closeService")),
              },
              {
                path: "reservas",
                lazy: lazy(() => import("../pages/reservas")),
              },
              { path: "ventas", lazy: lazy(() => import("../pages/ventas")) },
              {
                path: "movimientos",
                lazy: lazy(() => import("../pages/movimientos")),
              },
              {
                path: "servicios",
                lazy: lazy(() => import("../pages/servicios")),
              },
              {
                path: "barberos",
                lazy: lazy(() => import("../pages/barberos")),
              },
            ],
          },
        ],
      },
    ],
  },
];
