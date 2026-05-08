export function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold`}
      style={{
        background: "rgba(248,223,176,0.15)",
        color: "#F8DFB0",
        border: "1px solid rgba(248,223,176,0.3)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {initials}
    </span>
  );
}
