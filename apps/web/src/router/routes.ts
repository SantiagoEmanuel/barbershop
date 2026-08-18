import { type RouteObject } from "react-router";
import { ErrorView } from "../components/errorView";
import { PublicLayout } from "../components/publicLayout";
import { RootLayout } from "../components/rootLayout";
import { withPermissions } from "../guard/permissionGuard";
import Home from "../pages/home";
import { PERMISSIONS, type Permission } from "../types";

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
 * para SEO. El resto (perfil y panel admin) se carga de forma diferida para
 * reducir el bundle inicial.
 */

/** Helper: convierte un import con `default` en una ruta lazy de react-router. */
const lazy =
  <T extends { default: React.ComponentType }>(load: () => Promise<T>) =>
  async () => ({ Component: (await load()).default });

const lazyWithPermissions =
  (
    permissions: Permission[],
    load: () => Promise<{ default: React.ComponentType }>,
  ) =>
  async () => ({
    Component: withPermissions((await load()).default, permissions),
  });

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
            path: "turno/confirmar/:appointmentId",
            lazy: lazy(() => import("../pages/confirmTurno")),
          },
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
              {
                index: true,
                lazy: lazyWithPermissions(
                  [
                    PERMISSIONS.REPORTS_READ,
                    PERMISSIONS.ORDERS_READ,
                    PERMISSIONS.APPOINTMENTS_READ_ANY,
                  ],
                  () => import("../pages/dashboard"),
                ),
              },
              {
                path: "turnos",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.APPOINTMENTS_READ_ANY, PERMISSIONS.BARBERS_READ],
                  () => import("../pages/shift"),
                ),
              },
              {
                path: "reservas",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.APPOINTMENTS_READ_ANY, PERMISSIONS.BARBERS_READ],
                  () => import("../pages/reservas"),
                ),
              },
              {
                path: "ventas",
                children: [
                  {
                    index: true,
                    lazy: lazyWithPermissions(
                      [
                        PERMISSIONS.ORDERS_READ,
                        PERMISSIONS.SALES_CREATE,
                        PERMISSIONS.APPOINTMENTS_READ_ANY,
                        PERMISSIONS.CATALOG_READ,
                        PERMISSIONS.BARBERS_READ,
                        PERMISSIONS.PAYMENT_METHODS_READ,
                      ],
                      () => import("../pages/ventas"),
                    ),
                  },
                  {
                    path: ":appointmentId",
                    lazy: lazyWithPermissions(
                      [
                        PERMISSIONS.ORDERS_READ,
                        PERMISSIONS.SALES_CREATE,
                        PERMISSIONS.APPOINTMENTS_READ_ANY,
                        PERMISSIONS.CATALOG_READ,
                        PERMISSIONS.BARBERS_READ,
                        PERMISSIONS.PAYMENT_METHODS_READ,
                      ],
                      () => import("../pages/ventas"),
                    ),
                  },
                ],
              },
              {
                path: "inventario",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.CATALOG_MANAGE],
                  () => import("../pages/inventario"),
                ),
              },
              {
                path: "ingresos",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.REPORTS_READ],
                  () => import("../pages/ingresos"),
                ),
              },
              {
                path: "egresos",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.FINANCE_MANAGE, PERMISSIONS.REPORTS_READ],
                  () => import("../pages/egresos"),
                ),
              },
              {
                path: "rendimientos",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.REPORTS_READ],
                  () => import("../pages/rendimientos"),
                ),
              },
              {
                path: "movimientos",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.ORDERS_READ],
                  () => import("../pages/movimientos"),
                ),
              },
              {
                path: "servicios",
                lazy: lazyWithPermissions(
                  [PERMISSIONS.CATALOG_MANAGE],
                  () => import("../pages/servicios"),
                ),
              },
              {
                path: "barberos",
                lazy: lazyWithPermissions(
                  [
                    PERMISSIONS.BARBERS_MANAGE,
                    PERMISSIONS.BARBER_SCHEDULES_MANAGE,
                    PERMISSIONS.USERS_READ,
                  ],
                  () => import("../pages/barberos"),
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
