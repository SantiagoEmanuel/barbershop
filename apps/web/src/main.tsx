import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./css/global.css";
import { routes } from "./router/routes";

const router = createBrowserRouter(routes);

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

const rootEl = document.getElementById("root")!;

// Solo la home ("/") se pre-renderiza. Hidratamos únicamente si el markup
// servido corresponde a esa ruta. En el resto montamos como SPA: si llegó
// contenido (p. ej. el service worker o un fallback sirvieron index.html para
// una sub-ruta) lo limpiamos antes de montar para evitar desajustes de
// hidratación. Así el cliente es robusto sea cual sea el shell servido.
const isPrerenderedHome = rootEl.firstChild && window.location.pathname === "/";

if (isPrerenderedHome) {
  hydrateRoot(rootEl, app);
} else {
  rootEl.replaceChildren();
  createRoot(rootEl).render(app);
}
