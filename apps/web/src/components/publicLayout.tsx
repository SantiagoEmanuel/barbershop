import { Outlet } from "react-router";
import { useAuthModal } from "../hooks/useAuthModal";
import { Footer } from "./layout/footer";
import { Navbar } from "./navbar";

/**
 * Layout del sitio público (home, perfil, mis-turnos).
 * Provee navbar (que se adapta al contexto) y footer.
 *
 * Para /admin/* se usa AdminLayout (más fino, sin footer).
 */
export function PublicLayout() {
  const { openAuth } = useAuthModal();
  return (
    <div className="bg-background text-text-primary font-body flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-marca text-background sr-only z-200 rounded-md px-4 py-2 font-semibold focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Navbar onOpenAuth={openAuth} />
      <main id="contenido" className="flex-1 pt-14 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
