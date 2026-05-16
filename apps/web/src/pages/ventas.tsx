import { Package, Scissors } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartLineRow } from "../components/cartLineRow";
import { PickerTabButton } from "../components/pickerTabButton";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { Row } from "../components/ui/row";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post } from "../lib/api";
import { useServicesStore } from "../store/useServicesStore";
import type { ApiResponse, Barber, Order, Product, Service } from "../types";
import type { CartLine } from "../types/cartLine";
import type { PickerTab } from "../types/picker";

export default function Ventas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const services = useServicesStore((s) => s.services);
  const getServices = useServicesStore((s) => s.getServices);
  const [picker, setPicker] = useState<PickerTab>("products");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<
    { id: string; name: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api<ApiResponse<Product[]>>("product"),
      api<ApiResponse<Barber[]>>("barber"),
      api<ApiResponse<Order[]>>(`order?date=${todayISO()}`),
      api<ApiResponse<{ id: string; name: string }[]>>("payment-methods"),
    ])
      .then(([prodRes, barberRes, ordersRes, pmRes]) => {
        setProducts(prodRes?.data ?? []);
        setBarbers(barberRes?.data ?? []);
        setTodayOrders(ordersRes?.data ?? []);
        setPaymentMethods(pmRes?.data ?? []);
        if (barberRes?.data?.[0]) setSelectedBarber(barberRes.data[0].id);
        if (pmRes?.data?.[0]) setSelectedPayment(pmRes.data[0].id);
      })
      .finally(() => setLoading(false));
    getServices();
  }, [getServices]);

  function addProduct(p: Product) {
    setCart((prev) => {
      const existing = prev.find(
        (l) => l.kind === "product" && l.id === p.id,
      ) as Extract<CartLine, { kind: "product" }> | undefined;
      if (existing) {
        return prev.map((l) =>
          l.kind === "product" && l.id === p.id
            ? { ...l, quantity: Math.min(l.quantity + 1, p.stock) }
            : l,
        );
      }
      return [
        ...prev,
        {
          kind: "product",
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: 1,
          stock: p.stock,
        },
      ];
    });
  }

  function addService(s: Service) {
    setCart((prev) => {
      const existing = prev.find((l) => l.kind === "service" && l.id === s.id);
      if (existing) {
        return prev.map((l) =>
          l.kind === "service" && l.id === s.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [
        ...prev,
        {
          kind: "service",
          id: s.id,
          name: s.name,
          price: s.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(line: CartLine, qty: number) {
    if (qty <= 0) {
      setCart((prev) =>
        prev.filter((l) => !(l.kind === line.kind && l.id === line.id)),
      );
      return;
    }
    setCart((prev) =>
      prev.map((l) => {
        if (l.kind !== line.kind || l.id !== line.id) return l;
        if (l.kind === "product") {
          return { ...l, quantity: Math.min(qty, l.stock) };
        }
        return { ...l, quantity: qty };
      }),
    );
  }

  const totals = useMemo(() => {
    const productsTotal = cart
      .filter((l) => l.kind === "product")
      .reduce((acc, l) => acc + l.price * l.quantity, 0);
    const servicesTotal = cart
      .filter((l) => l.kind === "service")
      .reduce((acc, l) => acc + l.price * l.quantity, 0);
    return {
      productsTotal,
      servicesTotal,
      grandTotal: productsTotal + servicesTotal,
      itemCount: cart.reduce((acc, l) => acc + l.quantity, 0),
    };
  }, [cart]);

  const dailyTotal = todayOrders
    .filter((o) => o.status === "paid")
    .reduce((acc, o) => acc + o.amount, 0);

  async function handleSell() {
    if (cart.length === 0 || !selectedBarber || !selectedPayment) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await post<ApiResponse<Order>>("order/counter", {
        paymentMethodId: selectedPayment,
        amount: totals.grandTotal,
        soldBy: selectedBarber,
        items: cart.map((l) => ({
          kind: l.kind,
          id: l.id,
          quantity: l.quantity,
          priceSnapshot: l.price,
        })),
      });

      if (!res?.data) throw new Error("No se pudo registrar la venta");

      setProducts((prev) =>
        prev.map((p) => {
          const line = cart.find((l) => l.kind === "product" && l.id === p.id);
          return line ? { ...p, stock: p.stock - line.quantity } : p;
        }),
      );

      setTodayOrders((prev) => [res.data!, ...prev]);

      setSuccess(
        `Venta registrada: ${formatARS(totals.grandTotal)} · ${totals.itemCount} item${totals.itemCount > 1 ? "s" : ""}`,
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

  const filteredServices = (services ?? []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
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
        description="Registrá ventas de mostrador. Podés combinar servicios y productos en una misma venta."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Órdenes hoy" value={todayOrders.length} icon="🛒" />
        <StatCard
          label="Total facturado hoy"
          value={formatARS(dailyTotal)}
          icon="💰"
          accent
        />
        <StatCard label="Items en carrito" value={totals.itemCount} icon="📋" />
        <StatCard
          label="A cobrar"
          value={formatARS(totals.grandTotal)}
          icon="💳"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
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

          <div className="border-border flex gap-1 self-start rounded-xl border bg-black/25 p-1">
            <PickerTabButton
              active={picker === "products"}
              onClick={() => setPicker("products")}
              icon={<Package size={14} />}
              label={`Productos (${filteredProducts.length})`}
            />
            <PickerTabButton
              active={picker === "services"}
              onClick={() => setPicker("services")}
              icon={<Scissors size={14} />}
              label={`Servicios (${filteredServices.length})`}
            />
          </div>

          <input
            type="text"
            placeholder={`Buscar ${picker === "products" ? "producto" : "servicio"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          />

          {picker === "products" ? (
            filteredProducts.length === 0 ? (
              <EmptyState
                icon="📦"
                title="Sin productos con stock"
                description="No hay productos disponibles para vender."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filteredProducts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => addProduct(p)}
                      className="bg-surface border-border hover:border-marca w-full rounded-xl border p-3 text-left transition-colors"
                    >
                      <p className="text-text-primary font-body text-sm font-medium">
                        {p.name}
                      </p>
                      <p className="text-marca font-body mt-0.5 text-xs font-semibold">
                        {formatARS(p.price)}
                      </p>
                      <p className="text-text-muted font-body text-xs">
                        Stock: {p.stock}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon="✂️"
              title="Sin servicios"
              description="No hay servicios activos."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredServices.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => addService(s)}
                    className="bg-surface border-border hover:border-marca w-full rounded-xl border p-3 text-left transition-colors"
                  >
                    <p className="text-text-primary font-body text-sm font-medium">
                      {s.name}
                    </p>
                    <p className="text-marca font-body mt-0.5 text-xs font-semibold">
                      {formatARS(s.price)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4">
          <p className="text-text-primary font-body text-sm font-semibold">
            Carrito
          </p>

          {cart.length === 0 ? (
            <div className="border-border flex flex-1 items-center justify-center rounded-xl border border-dashed py-10">
              <p className="text-text-muted font-body text-center text-sm">
                Tocá un producto o servicio
                <br />
                para agregarlo
              </p>
            </div>
          ) : (
            <>
              <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
                {cart.map((line) => (
                  <CartLineRow
                    type={line.kind}
                    key={`${line.kind}-${line.id}`}
                    line={line}
                    onUpdate={(qty) => updateQty(line, qty)}
                    onRemove={() => updateQty(line, 0)}
                  />
                ))}
              </ul>

              {/* Método de pago */}
              <div>
                <label className="text-text-muted font-body mb-1.5 block text-xs font-semibold tracking-wide uppercase">
                  Método de pago *
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="bg-surface border-border text-text-primary font-body w-full rounded-xl border px-3 py-2 text-sm outline-none"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-border flex flex-col gap-1 border-t pt-3">
                {totals.servicesTotal > 0 && (
                  <Row
                    label="Servicios"
                    value={formatARS(totals.servicesTotal)}
                  />
                )}
                {totals.productsTotal > 0 && (
                  <Row
                    label="Productos"
                    value={formatARS(totals.productsTotal)}
                  />
                )}
                <Row
                  label="Total"
                  value={formatARS(totals.grandTotal)}
                  emphasis
                />
              </div>

              {error && (
                <div className="bg-error/10 border-border-error text-error font-body rounded-lg border px-3 py-2 text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/10 text-success font-body rounded-lg px-3 py-2 text-xs">
                  {success}
                </div>
              )}

              <button
                onClick={handleSell}
                disabled={submitting || !selectedBarber || !selectedPayment}
                className="btn-marca mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
              >
                {submitting ? (
                  <Spinner size={16} />
                ) : (
                  `Confirmar venta · ${formatARS(totals.grandTotal)}`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
