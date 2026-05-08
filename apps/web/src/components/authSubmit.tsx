import { Spinner } from "./ui/spinner";

export function AuthSubmit({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: loading ? "rgba(248,223,176,0.5)" : "#F8DFB0",
        color: "#272630",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <Spinner size={16} /> : label}
    </button>
  );
}
