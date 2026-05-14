import {
  Link,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router";

/**
 * Pantalla genérica para errores capturados por React Router.
 * Maneja tres casos:
 *  - 404 (ruta inexistente): mensaje amable.
 *  - 4xx/5xx con statusText: muestra status + texto.
 *  - Cualquier otro (crash de runtime): muestra mensaje del error.
 */
export function ErrorView() {
  const location = useLocation();
  const error = useRouteError();

  let status: number | null = null;
  let title = "Algo salió mal";
  let message = "Ocurrió un error inesperado. Probá recargar la página.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = "Esta página no existe";
      message = `No pudimos encontrar ${location.pathname}. Puede que el link esté desactualizado.`;
    } else if (error.status === 401 || error.status === 403) {
      title = "No tenés acceso";
      message = "Iniciá sesión con una cuenta autorizada para ver esta página.";
    } else if (error.status >= 500) {
      title = "El servidor tuvo un problema";
      message =
        "Algo falló del otro lado. Intentá de nuevo en unos minutos o avisanos.";
    } else if (error.statusText) {
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <section className="bg-background relative flex min-h-dvh w-full items-center justify-center px-4 py-12">
      <div className="bg-surface border-marca/15 relative flex w-full max-w-md flex-col items-center gap-5 overflow-hidden rounded-2xl border p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-10">
        {/* Número de status decorativo de fondo */}
        {status != null && (
          <span
            aria-hidden
            className="text-marca/10 font-display pointer-events-none absolute inset-0 flex items-center justify-center text-[13rem] leading-none font-black select-none"
          >
            {status}
          </span>
        )}

        <div className="bg-error/10 border-error/30 text-error relative z-10 flex size-14 items-center justify-center rounded-full border text-2xl">
          <span aria-hidden>!</span>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="font-display text-text-primary text-2xl leading-tight font-bold sm:text-3xl">
            {title}
          </h1>
          <p className="text-text-muted font-body text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="relative z-10 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost rounded-xl px-5 py-2.5 text-sm"
          >
            Reintentar
          </button>
          <Link
            to="/"
            className="btn-marca rounded-xl px-5 py-2.5 text-center text-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
