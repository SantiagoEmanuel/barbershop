import { useId } from "react";

/**
 * Variante compacta de Field — pensada para forms dentro de modales del admin
 * (servicios, productos, barberos). Acepta string o number en value para
 * simplificar el handling con form state que muchas veces viene como string.
 */
export function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  readonly,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}) {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-text-muted font-body text-xs font-semibold tracking-wide uppercase"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readonly}
        className="border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border bg-black/30 px-3.5 py-2.5 text-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
      />
    </div>
  );
}
