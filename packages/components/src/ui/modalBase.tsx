import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useEffect, useRef, type ReactNode } from "react";

export function ModalBase({
  open,
  onClose,
  children,
  maxW = "max-w-120",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxW?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!open || !overlayRef.current || !panelRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25 },
      ).fromTo(
        panelRef.current,
        { y: 40, scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35 },
        "<0.05",
      );
    },
    { dependencies: [open] },
  );

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
      className="fixed inset-0 z-200 flex items-end justify-center bg-[rgba(20,20,28,0.82)] p-0 opacity-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        ref={panelRef}
        className={`bg-surface border-marca/12 relative w-full ${maxW} overflow-hidden rounded-t-2xl border pb-12 opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:pb-0`}
      >
        {children}
      </div>
    </div>
  );
}
