import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "./navItems";

/**
 * Dropdown de navegación del panel admin (desktop).
 *
 * En vez de mostrar los 7 NAV_ITEMS horizontalmente (que satura la navbar y
 * deja poco espacio para el logo y el user menu), mostramos un solo botón
 * con el nombre de la sección actual + un menú desplegable con toda la lista.
 *
 * El item activo dentro del menú se resalta con el color de la marca.
 */
export function AdminNavDropdown() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Encontrar el item activo para mostrar su label como trigger.
  // /admin → "Resumen" (end: true). /admin/turnos → "Turnos del día". Etc.
  const current = findActiveItem(location.pathname);

  // Cerrar al click afuera.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cerrar al cambiar de ruta.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "border-marca/15 font-body inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200",
          open
            ? "bg-marca/10 text-marca border-marca/35"
            : "text-text-secondary hover:text-marca hover:border-marca/30 bg-transparent",
        )}
      >
        <span className="opacity-80">{current?.icon}</span>
        <span className="tracking-tight">
          {current?.label ?? "Panel admin"}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="bg-surface-2 border-marca/15 absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-xl border shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="border-marca/10 border-b px-4 py-2">
            <p className="text-text-muted font-body text-[10px] font-bold tracking-widest uppercase">
              Secciones del panel
            </p>
          </div>
          <ul className="py-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "font-body flex items-center gap-3 px-4 py-2.5 text-sm font-medium no-underline transition-colors duration-150",
                      isActive
                        ? "bg-marca/10 text-marca"
                        : "text-text-secondary hover:bg-marca/6 hover:text-marca",
                    )
                  }
                >
                  <span className="shrink-0 opacity-80">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Reproduce la lógica de matching de NavLink para encontrar el item activo
 * a partir del pathname actual. Necesario para mostrar el label en el botón.
 */
function findActiveItem(pathname: string) {
  // Primero match exacto (para items con `end: true` como /admin).
  const exact = NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact;

  // Después match por prefijo (más específico gana).
  const matches = NAV_ITEMS.filter(
    (item) => !item.end && pathname.startsWith(item.href + "/"),
  );
  if (matches.length === 0) return NAV_ITEMS[0]; // fallback: Resumen
  return matches.reduce((a, b) => (a.href.length > b.href.length ? a : b));
}
