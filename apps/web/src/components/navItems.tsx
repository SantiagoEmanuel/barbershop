import { Icon } from "@config/components";
import type { NavItem } from "../types";

/**
 * Items de navegación del panel admin. Se consume desde Sidebar y MobileDrawer.
 * Vive en su propio archivo (en vez de mobileDrawer.tsx) para que React fast
 * refresh no se queje de mezclar componentes con constantes.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Resumen",
    icon: (
      <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
    ),
    end: true,
  },
  {
    href: "/admin/turnos",
    label: "Turnos del día",
    icon: <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  },
  {
    href: "/admin/reservas",
    label: "Reservas",
    icon: (
      <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    href: "/admin/ventas",
    label: "Ventas",
    icon: (
      <Icon d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    ),
  },
  {
    href: "/admin/inventario",
    label: "Inventario",
    icon: (
      <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
    ),
  },
  {
    href: "/admin/ingresos",
    label: "Ingresos",
    icon: <Icon d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />,
  },
  {
    href: "/admin/egresos",
    label: "Egresos",
    icon: <Icon d="M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6" />,
  },
  {
    href: "/admin/rendimientos",
    label: "Rendimientos",
    icon: (
      <Icon d="M6 9H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1zM20 3h-2a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM13 13h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z" />
    ),
  },
  {
    href: "/admin/movimientos",
    label: "Movimientos",
    icon: <Icon d="M18 20V10M12 20V4M6 20v-6" />,
  },
  {
    href: "/admin/servicios",
    label: "Servicios",
    icon: (
      <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    ),
  },
  {
    href: "/admin/barberos",
    label: "Barberos",
    icon: (
      <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    ),
  },
];
