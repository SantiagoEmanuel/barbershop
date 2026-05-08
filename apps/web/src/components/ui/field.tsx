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
      <label
        className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-border-strong)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border)";
        }}
      />
    </div>
  );
}
