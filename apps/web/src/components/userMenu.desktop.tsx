import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuthStore, type User } from "../store/useAuthStore";
import { UserAvatar } from "./ui/avatar";
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
      ? [
          {
            href: "/admin",
            label: "Panel admin",
            icon: "⚙",
          },
        ]
      : []),
    {
      href: "/perfil",
      label: "Mi perfil",
      icon: "◎",
    },
    {
      href: "/mis-turnos",
      label: "Mis turnos",
      icon: "◷",
    },
  ];
  return (
    <div
      ref={ref}
      className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <UserAvatar name={user.name} size="md" />
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {user.name}
          </p>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
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
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-150"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(248,223,176,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-marca)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-text-secondary)";
            }}
          >
            <span
              style={{
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              {item.icon}
            </span>{" "}
            {item.label}
          </button>
        ))}
        <div
          className="mt-1 pt-1"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-150"
            style={{
              color: "var(--color-error)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(224,128,128,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            → Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
