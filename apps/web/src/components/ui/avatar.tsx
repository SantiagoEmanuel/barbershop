const SIZES = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

type AvatarSize = keyof typeof SIZES;

export function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: AvatarSize;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`${SIZES[size]} bg-marca/15 text-marca border-marca/30 font-body inline-flex shrink-0 items-center justify-center rounded-full border font-semibold uppercase`}
    >
      {initials}
    </span>
  );
}
