import {
  Calendar,
  LogOut,
  Scissors,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import type { User } from "../types";
import { MenuLink } from "./menuLink";
import { UserAvatar } from "./ui/avatar";

/**
 * Menú dropdown del usuario que se abre desde el avatar en el navbar.
 *
 * El menú se adapta al rol y a la ruta actual:
 *  - admin en /admin/*    → muestra "Ir al sitio" (volver a página pública)
 *  - admin en sitio público → muestra "Panel admin" como acción destacada
 *  - cliente              → solo mis cosas (perfil, turnos)
 *
 * Cierra al click afuera (mousedown listener) y al cambio de ruta.
 */
export function UserMenu({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const logout = useAuthStore((s) => s.logout);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isAdmin = user.role === "admin";
  const inAdminArea = location.pathname.startsWith("/admin");

  return (
    <div
      ref={menuRef}
      className="bg-surface-2 border-marca/12 absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
    >
      {/* Header con identidad */}
      <div className="border-marca/8 flex items-center gap-3 border-b px-4 py-3.5">
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-text-primary font-body truncate text-sm font-semibold capitalize">
            {user.name}
          </p>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <span className="bg-marca/15 text-marca rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                Admin
              </span>
            )}
            <p className="text-text-muted font-body truncate text-xs">
              @{user.username}
            </p>
          </div>
        </div>
      </div>

      {/* Shortcut admin: cambia según área */}
      {isAdmin &&
        (inAdminArea ? (
          <MenuLink
            href="/"
            icon={<Scissors size={16} />}
            label="Ir al sitio"
            onClose={onClose}
          />
        ) : (
          <MenuLink
            href="/admin"
            icon={<Settings size={16} />}
            label="Panel admin"
            onClose={onClose}
          />
        ))}

      {/* Acciones de cliente — solo se muestran fuera del panel admin */}
      {!inAdminArea && (
        <>
          <MenuLink
            href="/perfil"
            icon={<UserIcon size={16} />}
            label="Mi perfil"
            onClose={onClose}
          />
          <MenuLink
            href="/mis-turnos"
            icon={<Calendar size={16} />}
            label="Mis turnos"
            onClose={onClose}
          />
        </>
      )}

      <div className="border-marca/8 mt-1 border-t pt-1">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="text-error hover:bg-error/8 font-body flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150"
        >
          <LogOut size={16} className="opacity-70" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
