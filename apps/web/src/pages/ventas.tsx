import { Package, Plus, Scissors, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatCard } from "../components/statCard";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS, todayISO } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post } from "../lib/api";
import { cn } from "../lib/cn";
import { useServicesStore } from "../store/useServicesStore";
import type {
  ApiResponse,
  Barber,
  Product,
  SaleRecord,
  Service,
} from "../types";

type PickerTab = "products" | "services";

type CartLine =
  | {
      kind: "product";
      id: string;
      name: string;
      price: number;
      quantity: number;
      stock: number;
    }
  | {
      kind: "service";
      id: string;
      name: string;
      price: number;
      quantity: number;
    };

export default function Ventas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const services = useServicesStore((s) => s.services);
  const getServices = useServicesStore((s) => s.getServices);
  const [picker, setPicker] = useState<PickerTab>("products");
  const [cart, setCart] = useState<CartLine[]>([]);
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
    getServices();
  }, [getServices]);

  function addProduct(p: Product) {
    setCart((prev) => {
      const existing = prev.find(
        (l) => l.kind === "product" && l.id === p.id,
      ) as
        | Extract<
            CartLine,
            {
              kind: "product";
            }
          >
        | undefined;
      if (existing) {
        return prev.map((l) =>
          l.kind === "product" && l.id === p.id
            ? {
                ...l,
                quantity: Math.min(l.quantity + 1, p.stock),
              }
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
      const existing = prev.find(
        (l) => l.kind === "service" && l.id === s.id,
      ) as
        | Extract<
            CartLine,
            {
              kind: "service";
            }
          >
        | undefined;
      if (existing) {
        return prev.map((l) =>
          l.kind === "service" && l.id === s.id
            ? {
                ...l,
                quantity: l.quantity + 1,
              }
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
          return {
            ...l,
            quantity: Math.min(qty, l.stock),
          };
        }
        return {
          ...l,
          quantity: qty,
        };
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
      const productCalls = cart
        .filter(
          (
            l,
          ): l is Extract<
            CartLine,
            {
              kind: "product";
            }
          > => l.kind === "product",
        )
        .map((l) =>
          post("product-sales", {
            productId: l.id,
            soldBy: selectedBarber,
            quantity: l.quantity,
            priceSnapshot: l.price,
          }),
        );

      const serviceCalls = cart
        .filter(
          (
            l,
          ): l is Extract<
            CartLine,
            {
              kind: "service";
            }
          > => l.kind === "service",
        )
        .map((l) =>
          post("service-sales", {
            serviceId: l.id,
            soldBy: selectedBarber,
            quantity: l.quantity,
            priceSnapshot: l.price,
          }),
        );

      await Promise.all([...productCalls, ...serviceCalls]);
      setProducts((prev) =>
        prev.map((p) => {
          const line = cart.find((l) => l.kind === "product" && l.id === p.id);
          return line
            ? {
                ...p,
                stock: p.stock - line.quantity,
              }
            : p;
        }),
      );

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
        <StatCard label="Ventas hoy" value={sales.length} icon="🛒" />
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
              <div className="grid max-h-112 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredProducts.map((p) => {
                  const inCart = cart.find(
                    (l) => l.kind === "product" && l.id === p.id,
                  );
                  return (
                    <PickerCard
                      key={p.id}
                      onClick={() => addProduct(p)}
                      active={!!inCart}
                      title={p.name}
                      meta={`Stock: ${p.stock}${inCart ? ` · En carrito: ${inCart.quantity}` : ""}`}
                      price={p.price}
                      kind="product"
                    />
                  );
                })}
              </div>
            )
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon="✂️"
              title="Sin servicios"
              description="No hay servicios cargados todavía."
            />
          ) : (
            <div className="grid max-h-112 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredServices.map((s) => {
                const inCart = cart.find(
                  (l) => l.kind === "service" && l.id === s.id,
                );
                return (
                  <PickerCard
                    key={s.id}
                    onClick={() => addService(s)}
                    active={!!inCart}
                    title={s.name}
                    meta={`${s.durationMinutes} min${inCart ? ` · En carrito: ${inCart.quantity}` : ""}`}
                    price={s.price}
                    kind="service"
                  />
                );
              })}
            </div>
          )}
        </div>

        <aside className="bg-surface border-border lg:bg-surface/60 flex flex-col gap-3 self-start rounded-2xl border p-4 sm:p-5 lg:sticky lg:top-24">
          <header className="flex items-center justify-between">
            <p className="text-text-primary font-display text-base font-bold">
              Carrito
            </p>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-text-muted hover:text-error font-body text-xs transition-colors"
              >
                Vaciar
              </button>
            )}
          </header>

          {cart.length === 0 ? (
            <div className="border-border flex flex-1 items-center justify-center rounded-xl border border-dashed py-10">
              <p className="text-text-muted font-body text-center text-sm">
                Toca un producto o servicio
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

              <button
                onClick={handleSell}
                disabled={submitting || !selectedBarber}
                className="btn-marca mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
              >
                {submitting ? (
                  <Spinner size={16} />
                ) : (
                  <>
                    <Plus size={16} /> Registrar venta
                  </>
                )}
              </button>
            </>
          )}

          {success && (
            <div className="bg-success/10 border-success/30 text-success font-body rounded-lg border px-3 py-2 text-xs">
              ✓ {success}
            </div>
          )}
        </aside>
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
                <Package
                  size={16}
                  className="text-text-muted shrink-0 opacity-70"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-semibold">
                    {s.product?.name}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    ×{s.quantity} · {s.barber?.name}
                  </p>
                </div>
                <span className="text-marca font-body text-sm font-bold tabular-nums">
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
function PickerTabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-body inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200",
        active
          ? "bg-marca text-background"
          : "text-text-muted hover:text-text-primary bg-transparent",
      )}
    >
      {icon} {label}
    </button>
  );
}
function PickerCard({
  onClick,
  active,
  title,
  meta,
  price,
  kind,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  meta: string;
  price: number;
  kind: "product" | "service";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150",
        active
          ? "bg-marca/8 border-border-strong"
          : "bg-surface border-border hover:border-marca/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "shrink-0 opacity-70",
              kind === "service" ? "text-marca" : "text-text-muted",
            )}
          >
            {kind === "service" ? (
              <Scissors size={12} />
            ) : (
              <Package size={12} />
            )}
          </span>
          <p className="text-text-primary font-body truncate text-sm font-semibold">
            {title}
          </p>
        </div>
        <p className="text-text-muted font-body mt-0.5 text-xs">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-marca font-body text-sm font-bold tabular-nums">
          {formatARS(price)}
        </p>
        {active && (
          <span className="text-success font-body text-[10px]">✓ Agregado</span>
        )}
      </div>
    </button>
  );
}
function CartLineRow({
  line,
  type = "service",
  onUpdate,
  onRemove,
}: {
  line: CartLine;
  type: "product" | "service";
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  const isService = line.kind === "service";
  const max = line.kind === "product" ? line.stock : Infinity;
  return (
    <li
      className={cn(
        "border-border flex items-center gap-2 rounded-lg border px-2.5 py-2",
        isService ? "bg-marca/5" : "bg-black/15",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "shrink-0",
          isService ? "text-marca" : "text-text-muted opacity-70",
        )}
      >
        {isService ? <Scissors size={12} /> : <Package size={12} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-text-primary font-body truncate text-xs font-semibold">
          {line.name}
        </p>
        <p className="text-text-muted font-body text-[10px] tabular-nums">
          {formatARS(line.price)} c/u
        </p>
      </div>
      {type === "product" && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onUpdate(line.quantity - 1)}
            className="text-text-secondary border-border hover:border-marca/35 flex size-6 items-center justify-center rounded-md border bg-black/30 text-xs font-bold"
          >
            −
          </button>
          <span className="text-text-primary font-body w-5 text-center text-xs font-bold tabular-nums">
            {line.quantity}
          </span>
          <button
            onClick={() => onUpdate(line.quantity + 1)}
            disabled={line.quantity >= max}
            className="text-text-secondary border-border hover:border-marca/35 flex size-6 items-center justify-center rounded-md border bg-black/30 text-xs font-bold disabled:opacity-40"
          >
            +
          </button>
        </div>
      )}
      <span className="text-marca font-body w-16 shrink-0 text-right text-xs font-bold tabular-nums">
        {formatARS(line.price * line.quantity)}
      </span>
      <button
        onClick={onRemove}
        aria-label="Eliminar"
        className="text-text-muted hover:text-error transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "font-body",
          emphasis
            ? "text-text-primary text-sm font-bold"
            : "text-text-muted text-xs",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-body tabular-nums",
          emphasis
            ? "text-marca text-base font-bold"
            : "text-text-primary text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}
