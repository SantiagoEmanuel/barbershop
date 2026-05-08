export function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-marca font-body mb-1 text-xs font-bold tracking-widest uppercase">
        {title}
      </p>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="text-text-muted hover:text-text-secondary font-body text-sm no-underline transition-colors duration-200"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
