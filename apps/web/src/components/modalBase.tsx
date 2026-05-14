import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Overlay + container base para todos los modales.
 *  - Lock de scroll del body.
 *  - Cierre con Escape y con click en el overlay (no dentro).
 *  - Pequeña transición de fade + slide al abrir (sin librerías).
 *  - En mobile es bottom sheet; en sm+ es modal centrado.
 */
export function ModalBase({
  open,
  onClose,
  children,
  maxW = "max-w-sm",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxW?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Trigger de la transición — montamos primero invisible y al siguiente tick
  // animamos a visible. Así evitamos el "pop" inicial.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-200 flex items-end justify-center bg-[rgba(20,20,28,0.82)] p-0 backdrop-blur-sm transition-opacity duration-200 sm:items-center sm:p-4 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-surface border-marca/12 relative w-full ${maxW} overflow-hidden rounded-t-2xl border shadow-[0_24px_60px_rgba(0,0,0,0.5)] transition-all duration-250 sm:rounded-2xl ${
          mounted
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.98] opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
