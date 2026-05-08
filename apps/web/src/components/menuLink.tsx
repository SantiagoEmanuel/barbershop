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
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150"
      style={{
        color: "#CBC5C1",
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 500,
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "rgba(248,223,176,0.06)";
        (e.currentTarget as HTMLAnchorElement).style.color = "#F8DFB0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        (e.currentTarget as HTMLAnchorElement).style.color = "#CBC5C1";
      }}
    >
      <span style={{ fontSize: 13, opacity: 0.7 }}>{icon}</span> {label}
    </a>
  );
}
