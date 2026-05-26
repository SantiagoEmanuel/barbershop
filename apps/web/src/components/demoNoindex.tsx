import { useEffect } from "react";

/** Dominio real de producción (el único que debe indexarse en Google). */
const PROD_HOST = "pekobarber.com.ar";

/**
 * Evita que se indexen los entornos que NO son el dominio de producción:
 * el demo en `peko.santiagomustafa.com.ar`, previews de Vercel, localhost, etc.
 *
 * Es un SPA, así que lo hacemos en runtime — Google ejecuta JS y respeta el
 * `<meta name="robots">` que inyectamos acá. En producción no hace nada y queda
 * el `index, follow` estático del index.html. El effect no corre en el
 * prerender (build), por lo que el HTML estático de la home no se ve afectado.
 */
export function DemoNoindex() {
  useEffect(() => {
    const host = window.location.hostname;
    const isProd = host === PROD_HOST || host.endsWith(`.${PROD_HOST}`);
    if (isProd) return;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
  }, []);

  return null;
}
