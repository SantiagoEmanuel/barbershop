import type { ReactNode } from "react";
import type { Permission } from "./permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  permissions?: Permission[];
};
