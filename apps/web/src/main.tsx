import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./css/global.css";
import { routes } from "./router/routes";

const browserRouter = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={browserRouter} />
  </StrictMode>,
);
