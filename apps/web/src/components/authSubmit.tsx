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
      className="bg-marca text-background font-body disabled:bg-marca/50 mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
    >
      {loading ? <Spinner size={16} /> : label}
    </button>
  );
}
