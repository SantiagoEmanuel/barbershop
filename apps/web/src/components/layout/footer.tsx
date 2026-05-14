import { FooterCol } from "../footerCol";
import { BrandLogo } from "../ui/logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-marca/7 mt-auto border-t bg-[#1E1D28]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <BrandLogo size={18} />
            <p className="text-text-muted font-body text-sm leading-relaxed">
              Tu barbero de confianza en Quimilí. Más de diez años cuidando tu
              estilo sin vueltas ni demoras.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 sm:gap-x-16">
            <FooterCol
              title="Navegación"
              links={[
                { href: "/", label: "Inicio" },
                { href: "#servicios", label: "Servicios" },
                { href: "/barberos", label: "Barberos" },
                { href: "/nosotros", label: "Nosotros" },
              ]}
            />
            <FooterCol
              title="Tu cuenta"
              links={[
                { href: "/perfil", label: "Mi perfil" },
                { href: "/mis-turnos", label: "Mis turnos" },
              ]}
            />
          </div>
        </div>

        <div className="border-marca/6 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-text-muted font-body text-xs">
              © {year} Peko Barber · Quimilí, Argentina
            </p>
            <p className="text-text-muted/50 font-body text-xs">
              Hecho con ♥ por{" "}
              <span className="text-marca/50">tu barbero amigo</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
