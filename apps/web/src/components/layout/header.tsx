import { MenuIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card-bg flex items-center justify-between gap-8 px-4 py-2">
      <p className="text-xl font-bold">Barbería Peko</p>
      <div className="flex items-center gap-4">
        <button className="bg-marca text-background rounded-md px-2 py-1 font-semibold">
          Reservar Turno
        </button>
        <button>
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
