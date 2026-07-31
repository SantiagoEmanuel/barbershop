import { BrandLogo } from "@config/components";
import { Link } from "react-router";

export function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-marca/7 mt-auto border-t bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={14} />
            <span className="text-text-muted font-body text-xs">
              © {year} PJBARBERSHOP
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-text-muted hover:text-marca font-body text-xs no-underline transition-colors"
            >
              Ir al sitio
            </Link>
            <span className="text-text-muted/30 text-xs">·</span>
            <p className="text-text-muted/50 font-body text-xs">
              Hecho con ♥ por{" "}
              <a
                href="https://www.santiagomustafa.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-marca/50 hover:text-marca/70 no-underline transition-colors"
              >
                Santiago Mustafá
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
