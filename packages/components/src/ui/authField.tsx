export function AuthField({
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
    <div className="flex flex-col gap-1">
      <label className="text-text-secondary/70 font-body text-xs font-semibold tracking-wide">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border-marca/12 focus:border-marca/45 text-text-primary font-body w-full rounded-lg border bg-black/30 px-3.5 py-2.5 text-sm transition-all duration-200 outline-none focus:bg-black/40"
      />
    </div>
  );
}
