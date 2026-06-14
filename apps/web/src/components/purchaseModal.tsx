import { FieldInput, ModalBase, Spinner } from "@config/components";
import { useEffect, useState, type ReactNode } from "react";
import { post } from "../lib/api";
import type { ApiResponse, Product, Supply } from "../types";
import { formatARS } from "./ui/formatters";

export interface PaymentMethod {
  id: string;
  name: string;
}

/** Select nativo con el mismo estilo que FieldInput. */
export function FieldSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-text-muted font-body text-xs font-semibold tracking-wide uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border focus:border-border-strong text-text-primary font-body w-full rounded-xl border bg-black/30 px-3.5 py-2.5 text-sm outline-none"
      >
        {children}
      </select>
    </div>
  );
}

/**
 * Modal de compra / ingreso de stock. Suma stock al producto o insumo
 * elegido y, en el backend, genera el egreso variable asociado.
 * `initialType` y `lockType` permiten abrirlo fijado a un tipo desde
 * la pantalla de inventario.
 */
export function PurchaseModal({
  open,
  onClose,
  products,
  supplies,
  methods,
  onSaved,
  initialType = "product",
  lockType = false,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  supplies: Supply[];
  methods: PaymentMethod[];
  onSaved: () => void;
  initialType?: "product" | "supply";
  lockType?: boolean;
}) {
  const [itemType, setItemType] = useState<"product" | "supply">(initialType);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [methodId, setMethodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setItemType(initialType);
      setItemId((initialType === "product" ? products : supplies)[0]?.id ?? "");
      setQuantity("");
      setUnitCost("");
      setSupplier("");
      setMethodId("");
      setError("");
    }
  }, [open, initialType, products, supplies]);

  const items = itemType === "product" ? products : supplies;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await post<ApiResponse<unknown>>("purchases", {
        itemType,
        productId: itemType === "product" ? itemId : undefined,
        supplyId: itemType === "supply" ? itemId : undefined,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        supplier: supplier || undefined,
        paymentMethodId: methodId || undefined,
      });
      if (!res?.data) throw new Error("No se pudo registrar la compra");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  const total = Number(quantity || 0) * Number(unitCost || 0) || 0;

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3 className="font-display text-text-primary mb-1 text-lg font-bold">
          Registrar compra
        </h3>
        <p className="text-text-muted font-body mb-4 text-xs">
          Suma stock al ítem y genera un egreso variable.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!lockType && (
            <div className="border-border flex w-full rounded-xl border bg-black/25 p-1">
              {(["product", "supply"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setItemType(t);
                    setItemId(
                      (t === "product" ? products : supplies)[0]?.id ?? "",
                    );
                  }}
                  className={`font-body flex-1 rounded-lg py-1.5 text-sm font-bold transition-all ${
                    itemType === t
                      ? "bg-marca text-background"
                      : "text-text-muted"
                  }`}
                >
                  {t === "product" ? "Producto" : "Insumo"}
                </button>
              ))}
            </div>
          )}
          <FieldSelect
            label={itemType === "product" ? "Producto *" : "Insumo *"}
            value={itemId}
            onChange={setItemId}
          >
            {items.length === 0 && <option value="">No hay ítems</option>}
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </FieldSelect>
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Cantidad *"
              value={quantity}
              onChange={setQuantity}
              type="number"
              required
            />
            <FieldInput
              label="Costo unit. (cent.) *"
              value={unitCost}
              onChange={setUnitCost}
              type="number"
              required
            />
          </div>
          <FieldInput
            label="Proveedor"
            value={supplier}
            onChange={setSupplier}
            placeholder="Opcional"
          />
          <FieldSelect
            label="Método de pago"
            value={methodId}
            onChange={setMethodId}
          >
            <option value="">Sin especificar</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FieldSelect>
          <p className="text-text-muted font-body text-xs">
            Total del egreso: {formatARS(total)}
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
              disabled={loading || !itemId}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
