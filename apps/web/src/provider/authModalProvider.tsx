import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthModal } from "../components/authModal";
import { AuthModalContext } from "../context/authModalContext";

/**
 * Provider del modal de auth + toaster global.
 *
 * Solo provee contexto y monta los singletons (AuthModal + Toaster). El layout
 * visual (Navbar, Footer) ahora lo arman cada uno de los layouts (RootLayout,
 * AdminLayout), no este provider. Eso permite que el AuthModalProvider envuelva
 * TODA la app, incluido /admin/*, sin duplicar navegación.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  function openAuth(tab: "login" | "register" = "login") {
    setAuthTab(tab);
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
  }

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <Toaster />
      <AuthModal open={authOpen} onClose={closeAuth} defaultTab={authTab} />
    </AuthModalContext.Provider>
  );
}
