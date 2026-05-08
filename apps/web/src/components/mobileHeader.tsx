import { Icon } from "./ui/icon";

export function MobileHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  return (
    <header className="border-border bg-surface/95 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md lg:hidden">
      <div className="font-display text-text-primary text-base font-bold">
        THE <span className="text-marca">BARBER</span>
        <span className="text-text-muted font-body ml-2 text-xs font-normal">
          Admin
        </span>
      </div>
      <button
        onClick={onOpenDrawer}
        className="text-text-muted bg-marca/6 rounded-lg p-2"
      >
        <Icon d="M3 5h14M3 10h14M3 15h14" />
      </button>
    </header>
  );
}
