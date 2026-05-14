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
      <Navbar onOpenAuth={openAuth} />
      <main className="flex-1 pt-14 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
