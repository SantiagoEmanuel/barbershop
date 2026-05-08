import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBadge } from "../components/statusBadge";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post, put } from "../lib/api";
interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  priceSnapshot: number;
  notes?: string;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
  barber: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
}
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}
interface PaymentMethod {
  id: string;
  name: string;
  type: "cash" | "card" | "online";
}
interface CartItem {
  product: Product;
  quantity: number;
}
function PaymentIcon({ type }: { type: PaymentMethod["type"] }) {
  const map = {
    cash: "💵",
    card: "💳",
    online: "📱",
  };
  return <span>{map[type]}</span>;
}
export default function CierreServicio() {
  const { appointmentId } = useParams<{
    appointmentId: string;
  }>();
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
      api<{
        data: Appointment;
      }>(`appointments/${appointmentId}`),
      api<{
        data: Product[];
      }>("product"),
      api<{
        data: PaymentMethod[];
      }>("payment-methods"),
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
            ? {
                ...i,
                quantity: Math.min(i.quantity + 1, product.stock),
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }
  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }
  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity: qty,
            }
          : i,
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
      const orderRes = await post<{
        data: {
          id: string;
        };
      }>("order", {
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
        <div
          className="flex size-16 items-center justify-center rounded-full text-2xl"
          style={{
            background: "rgba(134,197,134,0.12)",
            border: "1px solid rgba(134,197,134,0.3)",
            color: "var(--color-success)",
          }}
        >
          ✓
        </div>
        <div>
          <h3
            className="mb-2 text-xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Servicio cerrado
          </h3>
          <p
            className="text-sm"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            La orden por{" "}
            <strong
              style={{
                color: "var(--color-marca)",
              }}
            >
              {formatARS(grandTotal)}
            </strong>{" "}
            fue registrada correctamente.
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
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-sm"
          style={{
            color: "var(--color-text-muted)",
            background: "rgba(248,223,176,0.06)",
            border: "1px solid var(--color-border)",
          }}
        >
          ← Volver
        </button>
        <SectionHeader eyebrow="Admin" title="Cerrar servicio" />
      </div>

      {}
      <div className="card flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="mb-1 text-xs font-bold tracking-widest uppercase"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Cliente
            </p>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              {appointment.clientName}
            </p>
            <p
              className="text-sm"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {appointment.clientPhone}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div
          className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {[
            {
              label: "Barbero",
              value: appointment.barber?.name,
            },
            {
              label: "Servicio",
              value: appointment.service?.name,
            },
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
              <p
                className="mb-0.5 text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {item.label}
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color: item.accent
                    ? "var(--color-marca)"
                    : "var(--color-text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {appointment.notes && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm"
            style={{
              background: "rgba(248,223,176,0.05)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            📝 {appointment.notes}
          </div>
        )}
      </div>

      {}
      {appointment.status !== "completed" && (
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-bold"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Productos adicionales
            </p>
            <span
              className="text-xs"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Opcional
            </span>
          </div>

          {}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />

          {}
          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150"
                  style={{
                    background: inCart
                      ? "rgba(248,223,176,0.08)"
                      : "rgba(0,0,0,0.2)",
                    border: `1px solid ${inCart ? "var(--color-border-strong)" : "var(--color-border)"}`,
                    opacity: p.stock === 0 ? 0.4 : 1,
                    cursor: p.stock === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="truncate font-semibold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {p.stock === 0 ? "Sin stock" : `Stock: ${p.stock}`}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(p.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {}
          {cart.length > 0 && (
            <div
              className="flex flex-col gap-2 pt-3"
              style={{
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Productos seleccionados
              </p>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(248,223,176,0.06)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <p
                    className="flex-1 text-sm font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity - 1)
                      }
                      className="flex size-6 items-center justify-center rounded-lg text-sm"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      −
                    </button>
                    <span
                      className="w-5 text-center text-sm font-bold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="flex size-6 items-center justify-center rounded-lg text-sm"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span
                    className="w-16 text-right text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    style={{
                      color: "var(--color-error)",
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {appointment.status !== "completed" && (
        <div className="card flex flex-col gap-4">
          {}
          <div className="flex flex-col gap-2">
            <div
              className="flex justify-between text-sm"
              style={{
                fontFamily: "var(--font-body)",
              }}
            >
              <span
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                Servicio
              </span>
              <span
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                {formatARS(serviceTotal)}
              </span>
            </div>
            {cart.map((i) => (
              <div
                key={i.product.id}
                className="flex justify-between text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  {i.product.name} ×{i.quantity}
                </span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {formatARS(i.product.price * i.quantity)}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between pt-2 text-base font-bold"
              style={{
                borderTop: "1px solid var(--color-border)",
                fontFamily: "var(--font-body)",
              }}
            >
              <span
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Total
              </span>
              <span
                style={{
                  color: "var(--color-marca)",
                }}
              >
                {formatARS(grandTotal)}
              </span>
            </div>
          </div>

          {}
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-widest uppercase"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Método de pago
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-150"
                  style={{
                    background:
                      selectedPayment === pm.id
                        ? "rgba(248,223,176,0.1)"
                        : "rgba(0,0,0,0.2)",
                    border: `1px solid ${selectedPayment === pm.id ? "var(--color-border-strong)" : "var(--color-border)"}`,
                    color:
                      selectedPayment === pm.id
                        ? "var(--color-marca)"
                        : "var(--color-text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <PaymentIcon type={pm.type} />
                  {pm.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-3 py-2.5 text-sm"
              style={{
                background: "rgba(220,100,100,0.1)",
                border: "1px solid var(--color-border-error)",
                color: "var(--color-error)",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedPayment}
            className="btn-marca flex w-full items-center justify-center gap-2 rounded-xl py-4"
            style={{
              opacity: submitting ? 0.7 : 1,
              fontSize: "0.9rem",
            }}
          >
            {submitting ? (
              <Spinner size={18} />
            ) : (
              `Confirmar cobro · ${formatARS(grandTotal)}`
            )}
          </button>
        </div>
      )}

      {}
      {appointment.status === "completed" && (
        <div
          className="rounded-xl px-4 py-5 text-center text-sm"
          style={{
            background: "rgba(134,197,134,0.06)",
            border: "1px solid rgba(134,197,134,0.2)",
            color: "var(--color-success)",
            fontFamily: "var(--font-body)",
          }}
        >
          ✓ Este turno ya fue completado y cobrado.
        </div>
      )}
    </div>
  );
}
