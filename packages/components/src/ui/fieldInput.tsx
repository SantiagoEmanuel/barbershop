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
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-text-muted font-body text-xs font-semibold tracking-wide uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border bg-black/30 px-3.5 py-2.5 text-sm transition-all duration-200 outline-none"
      />
    </div>
  );
}
