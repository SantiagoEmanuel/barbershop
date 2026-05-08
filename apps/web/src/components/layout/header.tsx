import { MenuIcon } from "lucide-react";

/**
 * Header simple alternativo. Hoy no se monta — el header en uso es Navbar.
 * Queda como starter por si en el futuro se usa para una vista más simple.
 */
export default function Header() {
  return (
    <header className="bg-surface flex items-center justify-between gap-8 px-4 py-2">
      <p className="font-display text-text-primary text-xl font-bold">
        Barbería Peko
      </p>
      <div className="flex items-center gap-4">
        <button className="bg-marca text-background hover:bg-marca-deep rounded-md px-2 py-1 font-semibold transition-colors">
          Reservar Turno
        </button>
        <button className="text-text-secondary hover:text-marca transition-colors">
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
