import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthModal } from "../components/authModal";
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/navbar";
import { AuthModalContext } from "../context/authModalContext";

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
      <div className="bg-background text-text-primary font-body flex min-h-dvh flex-col">
        <Navbar onOpenAuth={openAuth} />

        {/* padding-top compensa la navbar fixed */}
        <main className="flex-1 pt-14 sm:pt-16">{children}</main>

        <Footer />
      </div>
      <Toaster />

      <AuthModal open={authOpen} onClose={closeAuth} defaultTab={authTab} />
    </AuthModalContext.Provider>
  );
}
