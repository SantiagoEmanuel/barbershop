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

// Si el HTML viene pre-renderizado (build SSG) hidratamos; si no, montamos
// como SPA normal. Permite que la home sea estática/indexable sin romper el
// resto de rutas que se sirven como SPA.
if (rootEl.firstChild) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
