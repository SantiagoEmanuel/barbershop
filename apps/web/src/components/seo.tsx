/**
 * Metadatos por ruta usando el soporte nativo de React 19: los `<title>` /
 * `<meta>` / `<link>` que se rendericen acá se elevan automáticamente al
 * `<head>` del documento en el navegador.
 *
 * La home NO usa este componente: su head es estático y autoritativo en
 * `index.html` (es la página que se pre-renderiza e indexa). Acá marcamos el
 * resto de rutas, que requieren sesión, como `noindex`.
 */
const SITE_URL = "https://pekobarber.com.ar";

interface SeoProps {
  title: string;
  description?: string;
  /** Rutas privadas/con sesión → fuera del índice de Google. */
  noindex?: boolean;
  /** Path absoluto del sitio (ej. "/") para el canonical. */
  canonicalPath?: string;
}

export function Seo({ title, description, noindex, canonicalPath }: SeoProps) {
  const fullTitle = title.includes("Peko Barber")
    ? title
    : `${title} · Peko Barber`;

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalPath && (
        <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
      )}
    </>
  );
}
