import type { RouteObject } from "react-router";
import AdminLayout from "../components/adminLayout";
import { ErrorView } from "../components/errorView";
import { PublicLayout } from "../components/publicLayout";
import { RootLayout } from "../components/rootLayout";
import AdminGuard from "../guard/adminGuard";
import Barberos from "../pages/barberos";
import CierreServicio from "../pages/closeService";
import Dashboard from "../pages/dashboard";
import Home from "../pages/home";
import Movimientos from "../pages/movimientos";
import Perfil from "../pages/profile";
import Reservas from "../pages/reservas";
import Servicios from "../pages/servicios";
import Turnos from "../pages/shift";
import Ventas from "../pages/ventas";

/**
 * Estructura de rutas:
 *   RootLayout (provee AuthModalProvider + Toaster a toda la app)
 *     ├── PublicLayout (Navbar + Footer)
 *     │     ├── /          Home
 *     │     ├── /perfil
 *     │     └── /mis-turnos
 *     └── AdminGuard → AdminLayout (Navbar, sin footer)
 *           └── /admin/...  Dashboard, Turnos, etc.
 */
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
          { path: "perfil", Component: Perfil },
          // Reutilizamos Perfil — ya tiene la sección de turnos
          { path: "mis-turnos", Component: Perfil },
        ],
      },

      // ── Rutas de admin (protegidas) ───────────────────────
      {
        path: "/admin",
        Component: AdminGuard,
        children: [
          {
            Component: AdminLayout,
            children: [
              { index: true, Component: Dashboard },
              { path: "turnos", Component: Turnos },
              { path: "cierre/:appointmentId", Component: CierreServicio },
              { path: "reservas", Component: Reservas },
              { path: "ventas", Component: Ventas },
              { path: "movimientos", Component: Movimientos },
              { path: "servicios", Component: Servicios },
              { path: "barberos", Component: Barberos },
            ],
          },
        ],
      },
    ],
  },
];
