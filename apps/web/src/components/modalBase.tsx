import { useEffect, useRef, type ReactNode } from "react";
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
      className="fixed inset-0 z-200 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{
        background: "rgba(20,20,28,0.82)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className={`relative w-full ${maxW} overflow-hidden rounded-t-2xl sm:rounded-2xl`}
        style={{
          background: "#323140",
          border: "1px solid rgba(248,223,176,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
