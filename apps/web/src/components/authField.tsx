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
      <label
        className="text-xs tracking-wide"
        style={{
          color: "rgba(203,197,193,0.7)",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
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
        className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 outline-none"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(248,223,176,0.12)",
          color: "#EFEEDE",
          fontFamily: "'Nunito', sans-serif",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(248,223,176,0.45)";
          e.target.style.background = "rgba(0,0,0,0.4)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(248,223,176,0.12)";
          e.target.style.background = "rgba(0,0,0,0.3)";
        }}
      />
    </div>
  );
}
