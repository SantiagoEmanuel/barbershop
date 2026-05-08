import { useEffect, useState } from "react";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post } from "../lib/api";
import type {
  ApiResponse,
  Barber,
  CartItem,
  Product,
  SaleRecord,
} from "../types";

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
      api<ApiResponse<Product[]>>("product"),
      api<ApiResponse<Barber[]>>("barber"),
      api<ApiResponse<SaleRecord[]>>(`product-sales?date=${todayISO()}`),
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
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
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
          return inCart ? { ...p, stock: p.stock - inCart.quantity } : p;
        }),
      );
      setSuccess(
        `Venta registrada: ${formatARS(total)} · ${cart.length} producto${
          cart.length > 1 ? "s" : ""
        }`,
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
        {/* Productos */}
        <div className="flex flex-col gap-4">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Seleccioná productos
          </p>

          <div>
            <label className="text-text-muted font-body mb-1.5 block text-xs font-semibold tracking-wide uppercase">
              Barbero que vende *
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="bg-surface border-border text-text-primary font-body w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          />

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
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                      inCart
                        ? "bg-marca/8 border-border-strong"
                        : "bg-surface border-border"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary font-body truncate text-sm font-semibold">
                        {p.name}
                      </p>
                      <p className="text-text-muted font-body mt-0.5 text-xs">
                        Stock: {p.stock}
                        {inCart ? ` · En carrito: ${inCart.quantity}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-marca font-body text-sm font-bold">
                        {formatARS(p.price)}
                      </p>
                      {inCart && (
                        <span className="text-success text-xs">✓ Agregado</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="flex flex-col gap-4">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Carrito
          </p>

          {cart.length === 0 ? (
            <div className="bg-surface border-border flex flex-1 items-center justify-center rounded-xl border border-dashed py-12">
              <p className="text-text-muted font-body text-sm">
                Seleccioná productos de la izquierda
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-surface border-border flex items-center gap-3 rounded-xl border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body truncate text-sm font-semibold">
                      {item.product.name}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {formatARS(item.product.price)} c/u
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        updateQty(item.product.id, item.quantity - 1)
                      }
                      className="text-text-secondary border-border flex size-7 items-center justify-center rounded-lg border bg-black/30 text-sm font-bold transition-colors duration-150"
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
                      className="text-text-secondary border-border flex size-7 items-center justify-center rounded-lg border bg-black/30 text-sm font-bold transition-colors duration-150 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-marca font-body w-16 shrink-0 text-right text-sm font-bold">
                    {formatARS(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => updateQty(item.product.id, 0)}
                    className="text-error text-sm transition-colors duration-150"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="bg-marca/6 border-border-strong mt-1 flex items-center justify-between rounded-xl border px-4 py-3">
                <span className="text-text-primary font-body text-sm font-bold">
                  Total
                </span>
                <span className="text-marca font-display text-lg font-bold">
                  {formatARS(total)}
                </span>
              </div>

              {error && (
                <div className="bg-error/10 border-border-error text-error font-body rounded-xl border px-3 py-2.5 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/10 border-success/30 text-success font-body rounded-xl border px-3 py-2.5 text-sm">
                  ✓ {success}
                </div>
              )}

              <button
                onClick={handleSell}
                disabled={submitting || !selectedBarber}
                className="btn-marca mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 disabled:opacity-70"
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

      {sales.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-text-muted font-body text-xs font-bold tracking-widest uppercase">
            Ventas registradas hoy
          </p>
          <div className="flex flex-col gap-2">
            {sales.map((s) => (
              <div
                key={s.id}
                className="bg-surface border-border flex items-center gap-3 rounded-xl border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {s.product?.name}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    ×{s.quantity} · {s.barber?.name}
                  </p>
                </div>
                <span className="text-marca font-body text-sm font-bold">
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
