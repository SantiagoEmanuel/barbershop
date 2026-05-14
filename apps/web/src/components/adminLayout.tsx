import { Outlet } from "react-router";
import { useAuthModal } from "../hooks/useAuthModal";
import { Navbar } from "./navbar";

/**
 * Layout para rutas /admin/*.
 *
 * La navegación principal (links de admin, drawer móvil) la maneja el `Navbar`
 * unificado — detecta que estamos en /admin/* y muestra los items correctos.
 * Por eso este layout es más fino que antes: solo provee el container del main.
 */
export default function AdminLayout() {
  const { openAuth } = useAuthModal();

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <Navbar onOpenAuth={openAuth} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-20 pb-8 sm:px-6 sm:pt-24 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
