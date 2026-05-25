import { useNavigate } from "react-router";
import type { PaymentViewState } from "../../types/payment";

export function PaymentActions({
  state,
  onRefresh,
}: {
  state: PaymentViewState;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();
  if (state === "failed") {
    return (
      <div className="mt-7 flex w-full flex-col gap-2.5">
        <button
          className="btn-marca w-full"
          onClick={() => navigate("/perfil")}
        >
          Reintentar pago
        </button>
        <button className="btn-ghost w-full" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    );
  }
  if (state === "pending") {
    return (
      <div className="mt-7 flex w-full flex-col gap-2.5">
        <button
          className="btn-marca w-full"
          onClick={() => navigate("/perfil")}
        >
          Ir a mi perfil
        </button>
        <button className="btn-ghost w-full" onClick={onRefresh}>
          Actualizar estado
        </button>
      </div>
    );
  }
  return (
    <div className="mt-7 flex w-full flex-col gap-2.5">
      <button
        className="btn-marca w-full"
        onClick={() => navigate(state === "paid" ? "/mis-turnos" : "/perfil")}
      >
        {state === "paid" ? "Ver mi turno" : "Ir a mi perfil"}
      </button>
    </div>
  );
}
