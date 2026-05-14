import { ModalBase } from "../modalBase";
import { Spinner } from "./spinner";

/**
 * Confirmación modal reutilizable. Reemplaza al `confirm()` nativo del browser
 * (que es horrible en mobile y no respeta el tema).
 *
 * `variant`:
 *   - "danger" → acción destructiva (cancelar turno, desactivar barbero)
 *   - "default" → confirmación neutral (guardar, aplicar cambios)
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}) {
  const isDanger = variant === "danger";

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="flex flex-col gap-5 px-6 py-6">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className={`flex size-11 shrink-0 items-center justify-center rounded-full border text-lg ${
              isDanger
                ? "bg-error/12 border-error/30 text-error"
                : "bg-marca/10 border-marca/25 text-marca"
            }`}
          >
            {isDanger ? "⚠" : "?"}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="font-display text-text-primary text-base leading-tight font-bold sm:text-lg">
              {title}
            </h3>
            {description && (
              <p className="text-text-muted font-body text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`font-body inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors duration-150 disabled:opacity-70 ${
              isDanger
                ? "bg-error text-white hover:bg-[#c96b6b]"
                : "bg-marca text-background hover:bg-marca-deep"
            }`}
          >
            {loading && <Spinner size={14} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
