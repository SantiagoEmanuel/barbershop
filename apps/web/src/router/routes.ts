import type { RouteObject } from "react-router";
import AdminLayout from "../components/adminLayout";
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

export const routes: RouteObject[] = [
  // ── Rutas públicas ────────────────────────────────────────
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "perfil",
        Component: Perfil,
      },
      {
        path: "mis-turnos",
        Component: Perfil, // Reutilizamos Perfil — ya tiene la sección de turnos
      },
    ],
  },

  // ── Rutas de admin (protegidas) ───────────────────────────
  {
    path: "/admin",
    Component: AdminGuard, // Verifica role === "admin", redirige a / si no
    children: [
      {
        Component: AdminLayout, // Layout propio con sidebar
        children: [
          {
            index: true,
            Component: Dashboard,
          },
          {
            path: "turnos",
            Component: Turnos,
          },
          {
            path: "cierre/:appointmentId",
            Component: CierreServicio,
          },
          {
            path: "reservas",
            Component: Reservas,
          },
          {
            path: "ventas",
            Component: Ventas,
          },
          {
            path: "movimientos",
            Component: Movimientos,
          },
          {
            path: "servicios",
            Component: Servicios,
          },
          {
            path: "barberos",
            Component: Barberos,
          },
        ],
      },
    ],
  },
];
