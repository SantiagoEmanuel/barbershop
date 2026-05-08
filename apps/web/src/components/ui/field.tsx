/**
 * Input estándar con label arriba y estilos de la marca.
 * Se usa principalmente dentro del flujo de booking.
 */
export function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-text-muted font-body mb-1.5 block text-xs font-semibold tracking-wide uppercase">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border bg-black/25 px-4 py-3 text-sm transition-all duration-200 outline-none"
      />
    </div>
  );
}
