import { EmptyState, SectionHeader, Spinner } from "@config/components";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { formatARS, formatDate } from "../components/ui/formatters";
import { api } from "../lib/api";
import type { ApiResponse, Appointment } from "../types";

type State = "loading" | "success" | "error";

/**
 * Página a la que apunta el botón "Confirmar turno" del email.
 * Confirma el turno automáticamente al cargar (PATCH público con el id como
 * token de capacidad) y muestra el resultado.
 */
export default function ConfirmTurno() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  // Evita doble ejecución del efecto en StrictMode (dev).
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    if (!appointmentId) {
      setState("error");
      return;
    }

    api<ApiResponse<Appointment>>(`appointments/${appointmentId}/confirm`, {
      method: "PATCH",
    })
      .then((res) => {
        if (!res?.data) {
          setState("error");
          return;
        }
        setAppointment(res.data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [appointmentId]);

  if (state === "loading") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <Spinner size={32} />
        <p className="text-text-secondary font-body text-sm">
          Confirmando tu turno…
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          icon="⚠️"
          title="No pudimos confirmar tu turno"
          description="Puede que el link haya expirado o el turno ya no esté disponible. Si tenés dudas, escribinos."
          action={
            <button
              onClick={() => navigate("/")}
              className="btn-ghost rounded-xl px-4 py-2 text-sm"
            >
              Volver al inicio
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      <div className="bg-success/12 border-success/30 text-success flex size-16 items-center justify-center rounded-full border text-3xl">
        ✓
      </div>

      <SectionHeader
        align="center"
        title="¡Turno confirmado!"
        description={`Te esperamos${appointment?.barber?.name ? ` con ${appointment.barber.name}` : ""}. Si no podés asistir, avisanos con tiempo.`}
      />

      {appointment && (
        <div className="bg-surface border-border flex w-full flex-col gap-2 rounded-2xl border p-5 text-left">
          <Detail label="Servicio" value={appointment.service?.name} />
          <Detail label="Barbero" value={appointment.barber?.name} />
          <Detail label="Fecha" value={formatDate(appointment.date)} />
          <Detail
            label="Horario"
            value={`${appointment.startTime}hs - ${appointment.endTime}hs`}
          />
          <Detail label="Precio" value={formatARS(appointment.priceSnapshot)} />
        </div>
      )}

      <button
        onClick={() => navigate("/mis-turnos")}
        className="btn-marca w-full rounded-xl py-3 text-sm"
      >
        Ver mis turnos
      </button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-muted font-body text-xs tracking-wide uppercase">
        {label}
      </span>
      <span className="text-text-primary font-body text-sm font-semibold">
        {value ?? "—"}
      </span>
    </div>
  );
}
