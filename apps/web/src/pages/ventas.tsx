import { useEffect, useState } from "react";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post } from "../lib/api";
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string | null;
}
interface Barber {
  id: string;
  name: string;
  slug: string;
}
interface CartItem {
  product: Product;
  quantity: number;
}
interface SaleRecord {
  id: string;
  soldAt: string;
  quantity: number;
  priceSnapshot: number;
  product: {
    name: string;
  };
  barber: {
    name: string;
  };
}
export default function Ventas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    Promise.all([
      api<{
        data: Product[];
      }>("product"),
      api<{
        data: Barber[];
      }>("barber"),
      api<{
        data: SaleRecord[];
      }>(`product-sales?date=${todayISO()}`),
    ])
      .then(([prodRes, barberRes, salesRes]) => {
        setProducts(prodRes?.data ?? []);
        setBarbers(barberRes?.data ?? []);
        setSales(salesRes?.data ?? []);
        if (barberRes?.data?.[0]) setSelectedBarber(barberRes.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);
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
  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
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
  const total = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const dailyTotal = sales.reduce(
    (acc, s) => acc + s.priceSnapshot * s.quantity,
    0,
  );
  async function handleSell() {
    if (cart.length === 0 || !selectedBarber) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await Promise.all(
        cart.map((item) =>
          post("product-sales", {
            productId: item.product.id,
            soldBy: selectedBarber,
            quantity: item.quantity,
            priceSnapshot: item.product.price,
          }),
        ),
      );
      setProducts((prev) =>
        prev.map((p) => {
          const inCart = cart.find((i) => i.product.id === p.id);
          return inCart
            ? {
                ...p,
                stock: p.stock - inCart.quantity,
              }
            : p;
        }),
      );
      setSuccess(
        `Venta registrada: ${formatARS(total)} · ${cart.length} producto${cart.length > 1 ? "s" : ""}`,
      );
      setCart([]);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al registrar la venta",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0,
  );
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Ventas"
        description="Registrá ventas de productos en mostrador."
      />

      {}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ventas hoy" value={sales.length} icon="🛒" />
        <StatCard
          label="Total productos hoy"
          value={formatARS(dailyTotal)}
          icon="💰"
          accent
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <div className="flex flex-col gap-4">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Seleccioná productos
          </p>

          {}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Barbero que vende *
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-border-strong)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
            }}
          />

          {}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Sin productos con stock"
              description="No hay productos disponibles para vender."
            />
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.product.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150"
                    style={{
                      background: inCart
                        ? "rgba(248,223,176,0.08)"
                        : "var(--color-surface)",
                      border: `1px solid ${inCart ? "var(--color-border-strong)" : "var(--color-border)"}`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{
                          color: "var(--color-text-primary)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="mt-0.5 text-xs"
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Stock: {p.stock}
                        {inCart ? ` · En carrito: ${inCart.quantity}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: "var(--color-marca)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {formatARS(p.price)}
                      </p>
                      {inCart && (
                        <span
                          className="text-xs"
                          style={{
                            color: "var(--color-success)",
                          }}
                        >
                          ✓ Agregado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {}
        <div className="flex flex-col gap-4">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Carrito
          </p>

          {cart.length === 0 ? (
            <div
              className="flex flex-1 items-center justify-center rounded-xl py-12"
              style={{
                background: "var(--color-surface)",
                border: "1px dashed var(--color-border)",
              }}
            >
              <p
                className="text-sm"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Seleccioná productos de la izquierda
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {item.product.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {formatARS(item.product.price)} c/u
                    </p>
                  </div>

                  {}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity - 1)
                      }
                      className="flex size-7 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-150"
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
                      className="flex size-7 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-150"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border)",
                        opacity: item.quantity >= item.product.stock ? 0.4 : 1,
                      }}
                    >
                      +
                    </button>
                  </div>

                  <span
                    className="w-16 shrink-0 text-right text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => updateQty(item.product.id, 0)}
                    className="text-sm transition-colors duration-150"
                    style={{
                      color: "var(--color-error)",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {}
              <div
                className="mt-1 flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: "rgba(248,223,176,0.06)",
                  border: "1px solid var(--color-border-strong)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Total
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "var(--color-marca)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {formatARS(total)}
                </span>
              </div>

              {}
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
              {success && (
                <div
                  className="rounded-xl px-3 py-2.5 text-sm"
                  style={{
                    background: "rgba(134,197,134,0.1)",
                    border: "1px solid rgba(134,197,134,0.3)",
                    color: "var(--color-success)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ✓ {success}
                </div>
              )}

              <button
                onClick={handleSell}
                disabled={submitting || !selectedBarber}
                className="btn-marca mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5"
                style={{
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <Spinner size={16} />
                ) : (
                  `Registrar venta · ${formatARS(total)}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {}
      {sales.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Ventas registradas hoy
          </p>
          <div className="flex flex-col gap-2">
            {sales.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {s.product?.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    ×{s.quantity} · {s.barber?.name}
                  </p>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: "var(--color-marca)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {formatARS(s.priceSnapshot * s.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
