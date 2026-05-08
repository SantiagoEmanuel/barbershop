export function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p
        className="mb-1 text-xs font-bold tracking-widest uppercase"
        style={{ color: "#F8DFB0", fontFamily: "'Nunito', sans-serif" }}
      >
        {title}
      </p>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="text-sm transition-colors duration-200"
          style={{
            color: "#8B8899",
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#CBC5C1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#8B8899";
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
