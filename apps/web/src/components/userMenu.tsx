import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import type { User } from "../types";
import { MenuLink } from "./menuLink";
import { UserAvatar } from "./ui/avatar";

/**
 * Menú dropdown del usuario en el navbar mobile.
 * Cierra al click afuera (mousedown listener).
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="bg-surface-2 border-marca/12 absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
    >
      <div className="border-marca/8 flex items-center gap-3 border-b px-4 py-3.5">
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0">
          <p className="text-text-primary font-body truncate text-sm font-semibold">
            {user.name}
          </p>
          <p className="text-text-muted font-body truncate text-xs">
            {user.role === "admin" ? "✦ Administrador" : `@${user.username}`}
          </p>
        </div>
      </div>

      <div className="py-1">
        {user.role === "admin" && (
          <MenuLink
            href="/admin"
            icon="⚙"
            label="Panel de admin"
            onClose={onClose}
          />
        )}
        <MenuLink href="/perfil" icon="◎" label="Mi perfil" onClose={onClose} />
        <MenuLink
          href="/mis-turnos"
          icon="◷"
          label="Mis turnos"
          onClose={onClose}
        />
        <div className="border-marca/8 mt-1 border-t pt-1">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-error hover:bg-error/8 font-body flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150"
          >
            <span className="text-sm">→</span> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
