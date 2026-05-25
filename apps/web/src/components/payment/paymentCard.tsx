import type { ReactNode } from "react";
export function PaymentCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background font-body relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-3/5 w-[120%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at top center, var(--color-marca-subtle), transparent 65%)",
        }}
      />

      <div className="bg-surface border-border relative w-full max-w-md overflow-hidden rounded-xl border px-8 pt-11 pb-9 text-center shadow-2xl">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 opacity-60"
          style={{
            background:
              "repeating-linear-gradient(45deg, var(--color-marca) 0 10px, var(--color-surface) 10px 20px)",
          }}
        />

        <div className="mb-7 flex justify-center">
          <span className="badge-marca">✂ Peko Barber</span>
        </div>

        {children}
      </div>
    </div>
  );
}
