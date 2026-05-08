export function MenuLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClose}
      className="text-text-secondary hover:bg-marca/6 hover:text-marca font-body flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium no-underline transition-colors duration-150"
    >
      <span className="text-[13px] opacity-70">{icon}</span> {label}
    </a>
  );
}
