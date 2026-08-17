import type { ComponentType, ReactNode } from "react";
import { createElement } from "react";
import { Navigate } from "react-router";
import { getVisibleNavItems } from "../components/navItems";
import { hasAllPermissions } from "../lib/permissions";
import { useAuthStore } from "../store/useAuthStore";
import type { Permission } from "../types";

export function PermissionGuard({
  permissions,
  children,
}: {
  permissions: Permission[];
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!hasAllPermissions(user, permissions)) {
    return <Navigate to={getVisibleNavItems(user)[0]?.href ?? "/"} replace />;
  }

  return <>{children}</>;
}

export function withPermissions<P extends object>(
  Component: ComponentType<P>,
  permissions: Permission[],
) {
  function GuardedComponent(props: P) {
    return createElement(PermissionGuard, {
      permissions,
      children: createElement(Component, props),
    });
  }

  GuardedComponent.displayName = `WithPermissions(${Component.displayName ?? Component.name ?? "Component"})`;
  return GuardedComponent;
}
