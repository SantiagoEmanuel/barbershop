import { Icon } from "./ui/icon";

export function MobileHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  return (
    <header
      className="sticky top-0 z-10 flex h-14 items-center justify-between px-4 lg:hidden"
      style={{
        background: "rgba(50,49,64,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--color-text-primary)",
        }}
      >
        THE <span style={{ color: "var(--color-marca)" }}>BARBER</span>
        <span
          className="ml-2 text-xs font-normal"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Admin
        </span>
      </div>
      <button
        onClick={onOpenDrawer}
        className="rounded-lg p-2"
        style={{
          color: "var(--color-text-muted)",
          background: "rgba(248,223,176,0.06)",
        }}
      >
        <Icon d="M3 5h14M3 10h14M3 15h14" />
      </button>
    </header>
  );
}
