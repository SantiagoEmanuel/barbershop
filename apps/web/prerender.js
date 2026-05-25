// Pre-renderizado estático (SSG) sin framework.
//
// Se ejecuta después de `vite build`: compila un bundle SSR de `entry-server`,
// renderiza cada ruta indexable a HTML y lo inyecta dentro de `#root` en el
// `index.html` generado por el build cliente. Los crawlers (y bots sin JS)
// reciben así el contenido real; en el navegador la app hidrata ese markup.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(appRoot, "dist");
const ssrDir = path.join(appRoot, ".ssr");

// Rutas públicas e indexables que queremos como HTML estático.
const ROUTES = ["/"];

const ROOT_TAG = '<div id="root"></div>';

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(
      "No se encontró dist/index.html. Ejecutá `vite build` antes del prerender.",
    );
  }

  // 1. Bundle SSR de entry-server (bundleamos todo para no depender de .ts en runtime).
  await build({
    root: appRoot,
    logLevel: "warn",
    build: {
      ssr: path.join(appRoot, "src/entry-server.tsx"),
      outDir: ssrDir,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: "entry-server.js" } },
    },
    ssr: { noExternal: true },
  });

  const { render } = await import(
    path.join(ssrDir, "entry-server.js") + `?t=${Date.now()}`
  );

  const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
  if (!template.includes(ROOT_TAG)) {
    throw new Error(
      `No se encontró "${ROOT_TAG}" en index.html; no se puede inyectar el HTML pre-renderizado.`,
    );
  }

  // 2. Guardamos el shell vacío como app.html. Vercel sirve este archivo para
  //    las rutas NO pre-renderizadas (perfil, /admin, etc.) — así montan como
  //    SPA con #root vacío y no hay desajuste de hidratación con la home.
  fs.writeFileSync(path.join(distDir, "app.html"), template);

  // 3. Renderizar e inyectar cada ruta.
  for (const url of ROUTES) {
    const appHtml = await render(url);
    const html = template.replace(ROOT_TAG, `<div id="root">${appHtml}</div>`);

    const outPath =
      url === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, url.replace(/^\/+/, ""), "index.html");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`prerender ✓ ${url} → ${path.relative(appRoot, outPath)}`);
  }

  // 4. Limpieza del bundle SSR temporal.
  fs.rmSync(ssrDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("[prerender] falló:", err);
  process.exit(1);
});
