import {
  EmptyState,
  FieldInput,
  ModalBase,
  SectionHeader,
  Spinner,
} from "@config/components";
import { useEffect, useState } from "react";
import { PurchaseModal, type PaymentMethod } from "../components/purchaseModal";
import { formatARS } from "../components/ui/formatters";
import { api, post, put } from "../lib/api";
import type { ApiResponse, Product, Supply } from "../types";

type Tab = "products" | "supplies";

// ── Modal: producto (con costo) ───────────────────────────────
function ProductModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Product | null;
  onSave: (p: Product) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDesc(initial?.description ?? "");
      setPrice(String(initial?.price ?? ""));
      setCost(String(initial?.cost ?? "0"));
      setStock(String(initial?.stock ?? "0"));
      setError("");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        description: desc || undefined,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
      };
      const res = initial
        ? await put<ApiResponse<Product>>(`product/${initial.id}`, body)
        : await post<ApiResponse<Product>>("product", body);
      if (!res?.data) throw new Error("No se pudo guardar");
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3 className="font-display text-text-primary mb-4 text-lg font-bold">
          {initial ? "Editar producto" : "Nuevo producto"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldInput
            label="Nombre *"
            value={name}
            onChange={setName}
            required
          />
          <FieldInput
            label="Descripción"
            value={desc}
            onChange={setDesc}
            placeholder="Opcional"
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Precio venta (cent.) *"
              value={price}
              onChange={setPrice}
              type="number"
              required
            />
            <FieldInput
              label="Costo (cent.)"
              value={cost}
              onChange={setCost}
              type="number"
            />
          </div>
          <FieldInput
            label="Stock"
            value={stock}
            onChange={setStock}
            type="number"
          />
          <p className="text-text-muted font-body text-xs">
            El costo se usa para calcular la rentabilidad. También se actualiza
            al registrar una compra.
          </p>
          {error && (
            <p className="bg-error/10 text-error font-body rounded-lg px-3 py-2 text-xs">
              {error}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}

// ── Modal: insumo ─────────────────────────────────────────────
function SupplyModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Supply | null;
  onSave: (s: Supply) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("unidad");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setUnit(initial?.unit ?? "unidad");
      setCost(String(initial?.cost ?? "0"));
      setStock(String(initial?.stock ?? "0"));
      setThreshold(
        initial?.lowStockThreshold != null
          ? String(initial.lowStockThreshold)
          : "",
      );
      setError("");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        unit,
        cost: Number(cost),
        stock: Number(stock),
        lowStockThreshold: threshold ? Number(threshold) : undefined,
      };
      const res = initial
        ? await put<ApiResponse<Supply>>(`supplies/${initial.id}`, body)
        : await post<ApiResponse<Supply>>("supplies", body);
      if (!res?.data) throw new Error("No se pudo guardar");
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3 className="font-display text-text-primary mb-4 text-lg font-bold">
          {initial ? "Editar insumo" : "Nuevo insumo"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldInput
            label="Nombre *"
            value={name}
            onChange={setName}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Unidad" value={unit} onChange={setUnit} />
            <FieldInput
              label="Costo (cent.)"
              value={cost}
              onChange={setCost}
              type="number"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Stock"
              value={stock}
              onChange={setStock}
              type="number"
            />
            <FieldInput
              label="Alerta bajo stock"
              value={threshold}
              onChange={setThreshold}
              type="number"
              placeholder="Opcional"
            />
          </div>
          <p className="text-text-muted font-body text-xs">
            El consumo se ajusta editando el stock. Las compras lo aumentan
            automáticamente.
          </p>
          {error && (
            <p className="bg-error/10 text-error font-body rounded-lg px-3 py-2 text-xs">
              {error}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}

/** Indicador de stock con resaltado de bajo/sin stock. */
function StockBadge({ stock, low }: { stock: number; low?: number | null }) {
  const empty = stock === 0;
  const isLow = !empty && low != null && stock <= low;
  return (
    <div
      className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
        empty
          ? "bg-error/8 border-error/20"
          : isLow
            ? "bg-warning/8 border-warning/25"
            : "bg-success/8 border-success/20"
      }`}
    >
      <span
        className={`font-body text-sm font-bold ${
          empty ? "text-error" : isLow ? "text-warning" : "text-success"
        }`}
      >
        {stock}
      </span>
      <span className="text-text-muted font-body text-[9px]">stock</span>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────
export default function Inventario() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(false);
  const [supplyModal, setSupplyModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);

  function loadProducts() {
    return api<ApiResponse<Product[]>>("product?all=true").then((r) =>
      setProducts(r?.data ?? []),
    );
  }
  function loadSupplies() {
    return api<ApiResponse<Supply[]>>("supplies?all=true").then((r) =>
      setSupplies(r?.data ?? []),
    );
  }

  useEffect(() => {
    Promise.all([
      loadProducts(),
      loadSupplies(),
      api<ApiResponse<PaymentMethod[]>>("payment-methods").then((r) =>
        setMethods(r?.data ?? []),
      ),
    ]).finally(() => setLoading(false));
  }, []);

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
        title="Inventario"
        description="Stock de productos en venta e insumos del local."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPurchaseModal(true)}
              className="btn-ghost rounded-xl px-3 py-2 text-sm"
            >
              + Compra
            </button>
            <button
              onClick={() => {
                if (tab === "products") {
                  setEditingProduct(null);
                  setProductModal(true);
                } else {
                  setEditingSupply(null);
                  setSupplyModal(true);
                }
              }}
              className="btn-marca rounded-xl px-4 py-2 text-sm"
            >
              + Nuevo {tab === "products" ? "producto" : "insumo"}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-border flex w-fit rounded-xl border bg-black/25 p-1">
        {(["products", "supplies"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-body rounded-lg px-5 py-2 text-sm font-bold transition-all duration-200 ${
                active
                  ? "bg-marca text-background"
                  : "text-text-muted bg-transparent"
              }`}
            >
              {t === "products"
                ? `Productos (${products.length})`
                : `Insumos (${supplies.length})`}
            </button>
          );
        })}
      </div>

      {/* Productos */}
      {tab === "products" &&
        (products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Sin productos"
            description="Agregá productos para vender y controlar su stock."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {products.map((p) => {
              const margin =
                p.price > 0
                  ? Math.round(((p.price - (p.cost ?? 0)) / p.price) * 100)
                  : 0;
              return (
                <div
                  key={p.id}
                  className={`card flex items-center gap-4 ${p.isActive ? "" : "opacity-50"}`}
                >
                  <StockBadge stock={p.stock} />
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body text-sm font-bold">
                      {p.name}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      Venta {formatARS(p.price)} · Costo{" "}
                      {formatARS(p.cost ?? 0)} · Margen {margin}%
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductModal(true);
                    }}
                    className="bg-marca/6 text-text-muted border-border flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm"
                    title="Editar"
                  >
                    ✏
                  </button>
                </div>
              );
            })}
          </div>
        ))}

      {/* Insumos */}
      {tab === "supplies" &&
        (supplies.length === 0 ? (
          <EmptyState
            icon="🧴"
            title="Sin insumos"
            description="Cargá los insumos del local (shampoo, hojas, toallas, etc.)."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {supplies.map((s) => (
              <div
                key={s.id}
                className={`card flex items-center gap-4 ${s.isActive ? "" : "opacity-50"}`}
              >
                <StockBadge stock={s.stock} low={s.lowStockThreshold} />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body text-sm font-bold">
                    {s.name}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    {s.unit} · Costo {formatARS(s.cost)}
                    {s.lowStockThreshold != null &&
                      ` · alerta ≤ ${s.lowStockThreshold}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSupply(s);
                    setSupplyModal(true);
                  }}
                  className="bg-marca/6 text-text-muted border-border flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm"
                  title="Editar"
                >
                  ✏
                </button>
              </div>
            ))}
          </div>
        ))}

      <ProductModal
        open={productModal}
        onClose={() => setProductModal(false)}
        initial={editingProduct}
        onSave={(p) =>
          setProducts((prev) =>
            editingProduct
              ? prev.map((x) => (x.id === p.id ? p : x))
              : [...prev, p],
          )
        }
      />
      <SupplyModal
        open={supplyModal}
        onClose={() => setSupplyModal(false)}
        initial={editingSupply}
        onSave={(s) =>
          setSupplies((prev) =>
            editingSupply
              ? prev.map((x) => (x.id === s.id ? s : x))
              : [...prev, s],
          )
        }
      />
      <PurchaseModal
        open={purchaseModal}
        onClose={() => setPurchaseModal(false)}
        products={products}
        supplies={supplies}
        methods={methods}
        initialType={tab === "supplies" ? "supply" : "product"}
        onSaved={() => {
          loadProducts();
          loadSupplies();
        }}
      />
    </div>
  );
}
