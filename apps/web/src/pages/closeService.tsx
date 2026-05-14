import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post, put } from "../lib/api";
import type {
  ApiResponse,
  Appointment,
  CartItem,
  PaymentMethod,
  PaymentMethodType,
  Product,
} from "../types";

const PAYMENT_ICONS: Record<PaymentMethodType, string> = {
  cash: "💵",
  card: "💳",
  online: "📱",
};

function PaymentIcon({ type }: { type: PaymentMethodType }) {
  return <span>{PAYMENT_ICONS[type]}</span>;
}

export default function CierreServicio() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!appointmentId) return;
    Promise.all([
      api<ApiResponse<Appointment>>(`appointments/${appointmentId}`),
      api<ApiResponse<Product[]>>("product"),
      api<ApiResponse<PaymentMethod[]>>("payment-methods"),
    ])
      .then(([apptRes, prodRes, pmRes]) => {
        setAppointment(apptRes?.data ?? null);
        setProducts(prodRes?.data ?? []);
        setPaymentMethods(pmRes?.data ?? []);
        if (pmRes?.data?.[0]) setSelectedPayment(pmRes.data[0].id);
      })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      ),
    );
  }

  const serviceTotal = appointment?.priceSnapshot ?? 0;
  const productsTotal = cart.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0,
  );
  const grandTotal = serviceTotal + productsTotal;

  async function handleConfirm() {
    if (!appointment || !selectedPayment) return;
    setSubmitting(true);
    setError("");
    try {
      const orderRes = await post<ApiResponse<{ id: string }>>("order", {
        appointmentId: appointment.id,
        paymentMethodId: selectedPayment,
        amount: grandTotal,
      });
      if (!orderRes) throw new Error("No se pudo crear la orden de pago");
      await put(`appointments/${appointment.id}/status`, {
        status: "completed",
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!appointment) {
    return (
      <EmptyState
        icon="❌"
        title="Turno no encontrado"
        description="No se encontró el turno. Puede que haya sido eliminado."
        action={
          <button
            onClick={() => navigate("/admin/turnos")}
            className="btn-ghost rounded-xl px-4 py-2 text-sm"
          >
            Volver a turnos
          </button>
        }
      />
    );
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="bg-success/12 border-success/30 text-success flex size-16 items-center justify-center rounded-full border text-2xl">
          ✓
        </div>
        <div>
          <h3 className="font-display text-text-primary mb-2 text-xl font-bold">
            Servicio cerrado
          </h3>
          <p className="text-text-muted font-body text-sm">
            La orden por{" "}
            <strong className="text-marca">{formatARS(grandTotal)}</strong> fue
            registrada correctamente.
          </p>
        </div>
        <div className="flex w-full gap-2">
          <button
            onClick={() => navigate("/admin/turnos")}
            className="btn-ghost flex-1 rounded-xl py-3 text-sm"
          >
            Volver a turnos
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="btn-marca flex-1 rounded-xl py-3 text-sm"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const isCompleted = appointment.status === "completed";
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-text-muted bg-marca/6 border-border rounded-lg border p-2 text-sm"
        >
          ← Volver
        </button>
        <SectionHeader eyebrow="Admin" title="Cerrar servicio" />
      </div>

      {/* Info del turno */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-text-muted font-body mb-1 text-xs font-bold tracking-widest uppercase">
              Cliente
            </p>
            <p className="font-display text-text-primary text-lg font-bold capitalize">
              {appointment.clientName}
            </p>
            <p className="text-text-muted font-body text-sm">
              Nro: {appointment.clientPhone}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="border-border grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4">
          {[
            { label: "Barbero", value: appointment.barber.name },
            { label: "Servicio", value: appointment.service.name },
            {
              label: "Horario",
              value: `${appointment.startTime}–${appointment.endTime}`,
            },
            {
              label: "Precio servicio",
              value: formatARS(appointment.priceSnapshot),
              accent: true,
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-text-muted font-body mb-0.5 text-xs">
                {item.label}
              </p>
              <p
                className={`font-body text-sm font-semibold ${
                  item.accent ? "text-marca" : "text-text-primary"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {appointment.notes && (
          <div className="bg-marca/5 border-border text-text-muted font-body rounded-lg border px-3 py-2.5 text-sm">
            📝 {appointment.notes}
          </div>
        )}
      </div>

      {/* Productos adicionales */}
      {!isCompleted && (
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-text-primary font-body text-sm font-bold">
              Productos adicionales
            </p>
            <span className="text-text-muted font-body text-xs">Opcional</span>
          </div>

          <input
            type="text"
            placeholder="Buscar producto..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="border-border text-text-primary font-body w-full rounded-xl border bg-black/25 px-3.5 py-2.5 text-sm outline-none"
          />

          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                    inCart
                      ? "bg-marca/8 border-border-strong"
                      : "border-border bg-black/20"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-text-primary font-body truncate font-semibold">
                      {p.name}
                    </p>
                    <p className="text-text-muted text-xs">
                      {p.stock === 0 ? "Sin stock" : `Stock: ${p.stock}`}
                    </p>
                  </div>
                  <span className="text-marca font-body shrink-0 text-xs font-bold">
                    {formatARS(p.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {cart.length > 0 && (
            <div className="border-border flex flex-col gap-2 border-t pt-3">
              <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
                Productos seleccionados
              </p>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-marca/6 border-border flex items-center gap-3 rounded-xl border px-3 py-2"
                >
                  <p className="text-text-primary font-body flex-1 text-sm font-medium">
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity - 1)
                      }
                      className="text-text-secondary border-border flex size-6 items-center justify-center rounded-lg border bg-black/30 text-sm"
                    >
                      −
                    </button>
                    <span className="text-text-primary font-body w-5 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="text-text-secondary border-border flex size-6 items-center justify-center rounded-lg border bg-black/30 text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-marca font-body w-16 text-right text-sm font-bold">
                    {formatARS(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-error text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resumen + pago */}
      {!isCompleted && (
        <div className="card flex flex-col gap-4">
          <div className="font-body flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Servicio</span>
              <span className="text-text-primary">
                {formatARS(serviceTotal)}
              </span>
            </div>
            {cart.map((i) => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span className="text-text-muted">
                  {i.product.name} ×{i.quantity}
                </span>
                <span className="text-text-primary">
                  {formatARS(i.product.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
              <span className="text-text-primary">Total</span>
              <span className="text-marca">{formatARS(grandTotal)}</span>
            </div>
          </div>

          <div>
            <p className="text-text-muted font-body mb-2 text-xs font-bold tracking-widest uppercase">
              Método de pago
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {paymentMethods.map((pm) => {
                const selected = selectedPayment === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                      selected
                        ? "bg-marca/10 border-border-strong text-marca"
                        : "border-border text-text-secondary bg-black/20"
                    }`}
                  >
                    <PaymentIcon type={pm.type} />
                    {pm.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border-border-error text-error font-body rounded-xl border px-3 py-2.5 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedPayment}
            className="btn-marca flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[0.9rem] disabled:opacity-70"
          >
            {submitting ? (
              <Spinner size={18} />
            ) : (
              `Confirmar cobro · ${formatARS(grandTotal)}`
            )}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-success/6 border-success/20 text-success font-body rounded-xl border px-4 py-5 text-center text-sm">
          ✓ Este turno ya fue completado y cobrado.
        </div>
      )}
    </div>
  );
}
