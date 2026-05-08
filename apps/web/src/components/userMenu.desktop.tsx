import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import type { User } from "../types";
import { UserAvatar } from "./ui/avatar";

/**
 * Variante desktop del UserMenu — versión más rica con items navegables,
 * pensada para integrarse en una topbar futura. Hoy no se monta en ningún
 * sitio; queda como referencia.
 */
export function UserMenuDesktop({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const menuItems = [
    ...(user.role === "admin"
      ? [{ href: "/admin", label: "Panel admin", icon: "⚙" }]
      : []),
    { href: "/perfil", label: "Mi perfil", icon: "◎" },
    { href: "/mis-turnos", label: "Mis turnos", icon: "◷" },
  ];

  return (
    <div
      ref={ref}
      className="bg-surface-2 border-border absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
    >
      <div className="border-border flex items-center gap-3 border-b px-4 py-3.5">
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0">
          <p className="text-text-primary font-body truncate text-sm font-semibold">
            {user.name}
          </p>
          <p className="text-text-muted font-body text-xs">
            {user.role === "admin" ? "✦ Administrador" : `@${user.username}`}
          </p>
        </div>
      </div>

      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => {
              navigate(item.href);
              onClose();
            }}
            className="text-text-secondary hover:bg-marca/6 hover:text-marca font-body flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-150"
          >
            <span className="text-[13px] opacity-70">{item.icon}</span>{" "}
            {item.label}
          </button>
        ))}
        <div className="border-border mt-1 border-t pt-1">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-error hover:bg-error/8 font-body flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-150"
          >
            → Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
