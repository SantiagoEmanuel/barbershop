import { useEffect, useRef, type ReactNode } from "react";

/**
 * Overlay + container base para todos los modales.
 * Maneja scroll lock del body y close con Escape / click en overlay.
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
      className="fixed inset-0 z-200 flex items-end justify-center bg-[rgba(20,20,28,0.82)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        className={`bg-surface border-marca/10 relative w-full ${maxW} overflow-hidden rounded-t-2xl border shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:rounded-2xl`}
      >
        {children}
      </div>
    </div>
  );
}
