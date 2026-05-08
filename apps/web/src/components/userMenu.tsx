import { useEffect, useRef } from "react";
import { useAuthStore, type User } from "../store/useAuthStore";
import { MenuLink } from "./menuLink";
import { UserAvatar } from "./ui/avatar";
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
      className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl"
      style={{
        background: "#3E3D4E",
        border: "1px solid rgba(248,223,176,0.12)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    >
      {}
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{
          borderBottom: "1px solid rgba(248,223,176,0.08)",
        }}
      >
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold"
            style={{
              color: "#EFEEDE",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {user.name}
          </p>
          <p
            className="truncate text-xs"
            style={{
              color: "#8B8899",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {user.role === "admin" ? "✦ Administrador" : `@${user.username}`}
          </p>
        </div>
      </div>

      {}
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
        <div
          style={{
            borderTop: "1px solid rgba(248,223,176,0.08)",
          }}
          className="mt-1 pt-1"
        >
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-150"
            style={{
              color: "#e08080",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(220,100,100,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <span
              style={{
                fontSize: 14,
              }}
            >
              →
            </span>{" "}
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
