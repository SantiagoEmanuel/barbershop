import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function PickerTabButton({
  active,
  onClick,
  icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-body flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-marca text-background font-semibold"
          : "text-text-muted hover:text-text-primary",
      )}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
}
