import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { routes } from "./router/routes";

/**
 * Render del lado del servidor usado solo en build (ver `prerender.js`).
 *
 * Genera el HTML estático de una ruta para inyectarlo en `index.html`. Como la
 * app obtiene sus datos en efectos (no en loaders), no necesitamos datos de
 * hidratación: por eso `hydrate={false}`. En el navegador, `createBrowserRouter`
 * arranca limpio e hidrata el markup ya presente.
 */
export async function render(url: string): Promise<string> {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(new Request(`http://localhost${url}`));

  if (context instanceof Response) {
    throw new Error(
      `El prerender de "${url}" devolvió una redirección/Response inesperada.`,
    );
  }

  const router = createStaticRouter(dataRoutes, context);

  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </StrictMode>,
  );
}
